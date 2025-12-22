
class PasswordResetRequestView(generics.GenericAPIView):
    serializer_class = PasswordResetRequestSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        logger.info(LogMessages.PROCESSING_PASSWORD_RESET_REQUEST.format(request.data))

        # Validate serializer
        serializer = self.get_serializer(data=request.data, context={"request": request})
        if not serializer.is_valid():
            logger.error(LogMessages.SERIALIZER_VALIDATION_FAILED.format(serializer.errors))
            return Response({ResponseKeys.ERROR: serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data.get("email")
        username = serializer.validated_data.get("username")
        ip_address = request.META.get("REMOTE_ADDR")
        user_agent = request.META.get("HTTP_USER_AGENT", "")
        logger.info(LogMessages.PROCESSING_PASSWORD_RESET_FOR_EMAIL.format(email or username))

        # Get the domain/URL where the reset request is coming from
        reset_domain = None
        if request:
            origin = request.META.get('HTTP_ORIGIN')
            if origin:
                reset_domain = urlparse(origin).netloc
            else:
                host = request.META.get('HTTP_HOST')
                if host:
                    reset_domain = host.split(':')[0]

        # Extract tenant using email domain or request tenant
        try:
            if email:
                email_domain = email.split('@')[1]
                logger.debug(LogMessages.EMAIL_DOMAIN.format(email_domain))
                domain = Domain.objects.filter(domain=email_domain).first()
                if not domain:
                    logger.error(LogMessages.NO_DOMAIN_FOUND_FOR_EMAIL_DOMAIN.format(email_domain))
                    UserActivity.objects.create(
                        user=None,
                        tenant=Tenant.objects.first(),
                        action="password_reset_request",
                        performed_by=None,
                        details={"reason": ErrorMessages.NO_TENANT_FOUND_FOR_EMAIL_DOMAIN.format(email_domain)},
                        ip_address=ip_address,
                        user_agent=user_agent,
                        success=False,
                    )
                    return Response({ResponseKeys.ERROR: ErrorMessages.NO_TENANT_FOUND_FOR_EMAIL_DOMAIN.format(email_domain)}, status=status.HTTP_404_NOT_FOUND)

                tenant = domain.tenant
                logger.info(LogMessages.FOUND_TENANT_FOR_EMAIL_DOMAIN.format(tenant.schema_name, email_domain))
            elif username:
                tenant = getattr(request, 'tenant', None)
                if not tenant:
                    logger.error("No tenant found for username-based password reset")
                    UserActivity.objects.create(
                        user=None,
                        tenant=Tenant.objects.first(),
                        action="password_reset_request",
                        performed_by=None,
                        details={"reason": "Tenant not specified for username-based reset"},
                        ip_address=ip_address,
                        user_agent=user_agent,
                        success=False,
                    )
                    return Response({ResponseKeys.ERROR: "Tenant not specified for username-based reset"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({ResponseKeys.ERROR: "Either email or username must be provided"}, status=status.HTTP_400_BAD_REQUEST)
        except (ValueError, IndexError) as e:
            logger.error(ErrorMessages.INVALID_EMAIL_FORMAT.format(email or username, str(e)))
            UserActivity.objects.create(
                user=None,
                tenant=Tenant.objects.first(),
                action="password_reset_request",
                performed_by=None,
                details={"reason": ErrorMessages.INVALID_EMAIL_FORMAT.format("", str(e))},
                ip_address=ip_address,
                user_agent=user_agent,
                success=False,
            )
            return Response({ResponseKeys.ERROR: ErrorMessages.INVALID_EMAIL_FORMAT.format("", "")}, status=status.HTTP_400_BAD_REQUEST)

        # Perform DB operations in the tenant schema
        with tenant_context(tenant):
            try:
                if email:
                    user = CustomUser.objects.get(email=email, tenant=tenant)
                elif username:
                    user = CustomUser.objects.get(username=username, tenant=tenant)
                else:
                    return Response({ResponseKeys.ERROR: "Either email or username must be provided"}, status=status.HTTP_400_BAD_REQUEST)
            except CustomUser.DoesNotExist:
                logger.warning(LogMessages.USER_WITH_EMAIL_NOT_FOUND.format(email or username, tenant.schema_name))
                UserActivity.objects.create(
                    user=None,
                    tenant=tenant,
                    action="password_reset_request",
                    performed_by=None,
                    details={"reason": ErrorMessages.NO_USER_FOUND_WITH_EMAIL},
                    ip_address=ip_address,
                    user_agent=user_agent,
                    success=False,
                )
                return Response({ResponseKeys.ERROR: ErrorMessages.NO_USER_FOUND_WITH_EMAIL}, status=status.HTTP_404_NOT_FOUND)

            # Check if user is locked or suspended
            if user.is_locked or user.status == "suspended" or not user.is_active:
                logger.warning(LogMessages.USER_LOCKED_OR_SUSPENDED.format(user.email, tenant.schema_name))
                UserActivity.objects.create(
                    user=user,
                    tenant=tenant,
                    action="password_reset_request",
                    performed_by=None,
                    details={"reason": ErrorMessages.ACCOUNT_LOCKED_OR_SUSPENDED},
                    ip_address=ip_address,
                    user_agent=user_agent,
                    success=False,
                )
                return Response({ResponseKeys.ERROR: ErrorMessages.ACCOUNT_LOCKED_OR_SUSPENDED}, status=status.HTTP_403_FORBIDDEN)

            # Check if IP is blocked
            if BlockedIP.objects.filter(ip_address=ip_address, tenant=tenant, is_active=True).exists():
                logger.warning(LogMessages.IP_BLOCKED.format(ip_address, tenant.schema_name))
                UserActivity.objects.create(
                    user=user,
                    tenant=tenant,
                    action="password_reset_request",
                    performed_by=None,
                    details={"reason": ErrorMessages.THIS_IP_ADDRESS_IS_BLOCKED},
                    ip_address=ip_address,
                    user_agent=user_agent,
                    success=False,
                )
                return Response({ResponseKeys.ERROR: ErrorMessages.THIS_IP_ADDRESS_IS_BLOCKED}, status=status.HTTP_403_FORBIDDEN)

            # Create password reset token
            token = str(uuid.uuid4())
            expires_at = timezone.now() + timedelta(hours=1)
            PasswordResetToken.objects.create(
                user=user,
                tenant=tenant,
                token=token,
                expires_at=expires_at
            )
            logger.info(LogMessages.PASSWORD_RESET_TOKEN_CREATED.format(user.email, tenant.schema_name))

            # Send notification to external service
            try:
                from auth_service.utils.kafka_producer import publish_event

                event_payload = {
                    "event_type": "user.password.reset.requested",
                    "tenant_id": str(tenant.unique_id),
                    "timestamp": timezone.now().isoformat(),
                    "payload": {
                        "email": user.email,
                        "user_name": f"{user.first_name} {user.last_name}",
                        "reset_token": token,
                        "reset_link": token,
                        "ip_address": ip_address,
                        "user_agent": user_agent,
                        "user_id": str(user.id),
                        "expires_at": expires_at.isoformat(),
                        "reset_domain": reset_domain,
                        "tenant_name": tenant.name,
                        "tenant_logo": tenant.logo,
                        "tenant_primary_color": tenant.primary_color,
                        "tenant_secondary_color": tenant.secondary_color,
                        "tenant_unique_id": str(tenant.unique_id),
                        "tenant_schema": tenant.schema_name,
                    },
                    "metadata": {
                        "event_id": str(uuid.uuid4()),
                        "created_at": timezone.now().isoformat(),
                        "source": "auth-service",
                    },
                }

                success = publish_event("auth-events", event_payload)
                if success:
                    logger.info(LogMessages.NOTIFICATION_SENT_FOR_PASSWORD_RESET.format(user.email, "Kafka"))
                else:
                    logger.error(LogMessages.FAILED_TO_SEND_PASSWORD_RESET_NOTIFICATION.format(user.email, "Kafka send failed"))
            except Exception as e:
                logger.error(LogMessages.FAILED_TO_SEND_PASSWORD_RESET_NOTIFICATION.format(user.email, str(e)))

         

        return Response(
            {
                ResponseKeys.DETAIL: LogMessages.PASSWORD_RESET_TOKEN_GENERATED_SUCCESSFULLY,
                ResponseKeys.TENANT_SCHEMA: tenant.schema_name,
                ResponseKeys.EMAIL: email,
                ResponseKeys.USERNAME: username
            },
            status=status.HTTP_200_OK
        )


class PasswordResetConfirmView(generics.GenericAPIView):
    serializer_class = PasswordResetConfirmSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        logger.info(LogMessages.PROCESSING_PASSWORD_RESET_CONFIRMATION.format(request.data))

        serializer = self.get_serializer(data=request.data, context={"request": request})
        if not serializer.is_valid():
            logger.error(LogMessages.VALIDATION_FAILED_FOR_PASSWORD_RESET_CONFIRMATION.format(serializer.errors))
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        token = serializer.validated_data["token"]
        new_password = serializer.validated_data["new_password"]
        ip_address = request.META.get("REMOTE_ADDR")
        user_agent = request.META.get("HTTP_USER_AGENT", "")

        # The middleware has already set the tenant based on the token
        tenant = request.tenant
        logger.info(LogMessages.PROCESSING_PASSWORD_RESET_CONFIRMATION_IN_TENANT.format(tenant.schema_name))

        try:
            # Token already used?
            reset_token = PasswordResetToken.objects.select_related('user').filter(token=token).first()
            if not reset_token:
                logger.warning(LogMessages.INVALID_TOKEN.format(token, tenant.schema_name))
                UserActivity.objects.create(
                    user=None,
                    tenant=tenant,
                    action="password_reset_confirm",
                    performed_by=None,
                    details={"reason": ErrorMessages.INVALID_TOKEN},
                    ip_address=ip_address,
                    user_agent=user_agent,
                    success=False,
                )
                return Response({ResponseKeys.DETAIL: ErrorMessages.INVALID_OR_EXPIRED_TOKEN}, status=status.HTTP_400_BAD_REQUEST)

            if reset_token.used:
                logger.warning(LogMessages.TOKEN_ALREADY_USED.format(token, tenant.schema_name))
                UserActivity.objects.create(
                    user=reset_token.user,
                    tenant=tenant,
                    action="password_reset_confirm",
                    performed_by=None,
                    details={"reason": ErrorMessages.THIS_TOKEN_HAS_ALREADY_BEEN_USED},
                    ip_address=ip_address,
                    user_agent=user_agent,
                    success=False,
                )
                return Response({ResponseKeys.DETAIL: ErrorMessages.THIS_TOKEN_HAS_ALREADY_BEEN_USED}, status=status.HTTP_400_BAD_REQUEST)

            # Token expired?
            if reset_token.expires_at < timezone.now():
                logger.warning(LogMessages.TOKEN_EXPIRED.format(token, tenant.schema_name))
                UserActivity.objects.create(
                    user=reset_token.user,
                    tenant=tenant,
                    action="password_reset_confirm",
                    performed_by=None,
                    details={"reason": ErrorMessages.THIS_TOKEN_HAS_EXPIRED},
                    ip_address=ip_address,
                    user_agent=user_agent,
                    success=False,
                )
                return Response({ResponseKeys.DETAIL: ErrorMessages.THIS_TOKEN_HAS_EXPIRED}, status=status.HTTP_400_BAD_REQUEST)

            user = reset_token.user

            # Additional user checks
            if user.is_locked or user.status == "suspended" or not user.is_active:
                logger.warning(LogMessages.USER_LOCKED_OR_SUSPENDED.format(user.email, tenant.schema_name))
                UserActivity.objects.create(
                    user=user,
                    tenant=tenant,
                    action="password_reset_confirm",
                    performed_by=None,
                    details={"reason": ErrorMessages.ACCOUNT_IS_LOCKED_OR_SUSPENDED},
                    ip_address=ip_address,
                    user_agent=user_agent,
                    success=False,
                )
                return Response({ResponseKeys.DETAIL: ErrorMessages.ACCOUNT_IS_LOCKED_OR_SUSPENDED}, status=status.HTTP_403_FORBIDDEN)

            with transaction.atomic():
                user.set_password(new_password)
                user.last_password_reset = timezone.now()
                user.save()

                reset_token.used = True
                reset_token.save()

                logger.info(LogMessages.PASSWORD_RESET_SUCCESSFUL.format(user.email, tenant.schema_name))


                # Log successful activity
                UserActivity.objects.create(
                    user=user,
                    tenant=tenant,
                    action="password_reset_confirm",
                    performed_by=None,
                    details={},
                    ip_address=ip_address,
                    user_agent=user_agent,
                    success=True,
                )


            return Response({ResponseKeys.DETAIL: ErrorMessages.PASSWORD_RESET_SUCCESSFULLY}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception(LogMessages.ERROR_DURING_PASSWORD_RESET_CONFIRMATION.format(tenant.schema_name, str(e)))
            UserActivity.objects.create(
                user=None,
                tenant=tenant,
                action="password_reset_confirm",
                performed_by=None,
                details={"reason": f"Internal error: {str(e)}"},
                ip_address=ip_address,
                user_agent=user_agent,
                success=False,
            )
            return Response({ResponseKeys.DETAIL: ErrorMessages.PASSWORD_RESET_FAILED}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False)
    username = serializers.CharField(required=False)

    def validate(self, data):
        email = data.get('email')
        username = data.get('username')

        if not email and not username:
            raise serializers.ValidationError("Either 'email' or 'username' must be provided.")

        if email and username:
            raise serializers.ValidationError("Provide only one of 'email' or 'username', not both.")

        tenant = self.context["request"].tenant
        with tenant_context(tenant):
            if email:
                if not CustomUser.objects.filter(email=email, tenant=tenant).exists():
                    raise serializers.ValidationError(f"No user found with email '{email}' for this tenant.")
            elif username:
                if not CustomUser.objects.filter(username=username, tenant=tenant).exists():
                    raise serializers.ValidationError(f"No user found with username '{username}' for this tenant.")

        return data


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(write_only=True, min_length=8, required=True)

    def validate_token(self, value):
        tenant = self.context["request"].tenant
        with tenant_context(tenant):
            try:
                reset_token = PasswordResetToken.objects.get(token=value, tenant=tenant)
                if reset_token.expires_at < timezone.now():
                    raise serializers.ValidationError("This token has expired.")
                if reset_token.used:
                    raise serializers.ValidationError("This token has already been used.")
            except PasswordResetToken.DoesNotExist:
                raise serializers.ValidationError("Invalid token.")
        return value

    def validate_new_password(self, value):
        if not any(c.isupper() for c in value) or not any(c.isdigit() for c in value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter and one number.")
        return value


class UserPasswordRegenerateSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def validate(self, data):
        request = self.context["request"]
        if not (request.user.is_superuser or request.user.role == "admin"):
            raise serializers.ValidationError("Only admins or superusers can reset passwords.")
        email = data.get("email")
        with tenant_context(request.user.tenant):
            user = CustomUser.objects.filter(email=email).first()
            if not user:
                raise serializers.ValidationError("User with this email does not exist.")
            if user == request.user:
                raise serializers.ValidationError("You cannot reset your own password.")
        return data

