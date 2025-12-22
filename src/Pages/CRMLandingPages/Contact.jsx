
import React, { useState } from 'react';

import './LandingPageNew.css';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { MailIcon, MapPinIcon, PhoneIcon } from 'lucide-react';
import SupportChat from './SupportChat';

const Contact = () => {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', message: '' });
  const [status, setStatus] = useState(null);

  const sendMail = async ({ to, subject, body }) => {
    try {
      const endpoint = process.env.REACT_APP_SENDMAIL_ENDPOINT || '/api/send-mail';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, body }),
      });
      if (!res.ok) throw new Error('Failed to send');
      return { success: true };
    } catch (err) {
      const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailto;
      return { success: false, error: err.message };
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    if (!form.email || !form.message) {
      setStatus({ error: 'Please provide email and message.' });
      return;
    }
    const subject = `Message from ${form.firstName} ${form.lastName}`;
    const body = `Name: ${form.firstName} ${form.lastName}\nEmail: ${form.email}\n\n${form.message}`;
    const result = await sendMail({ to: 'info@e3os.com', subject, body });
    if (result.success) {
      setStatus({ success: 'Message sent — we will contact you shortly.' });
      setForm({ firstName: '', lastName: '', email: '', message: '' });
    } else {
      setStatus({ success: 'Opened mail client — please send to complete.' });
    }
  };
  return (
    <div className="contact-page">
      {/* Header Section */}
      <section className="contact-header">
        <h1>Get in touch with the E3OS Team</h1>
        <p>
          Have a question, need support, or want to book a demo? <br />
          We’d love to hear from you
        </p>
      </section>

      {/* Content Section */}
      <section className="contact-content">
        {/* Contact Form */}
        <div className="contact-form-card">
          <h3>Send us a message</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group-row">
              <div>
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
            <div className="form-group-single">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group-single">
              <textarea
                rows={6}
                name="message"
                placeholder="Write text here ..."
                value={form.message}
                onChange={handleChange}
                className="form-textarea"
              />
            </div>
            {status?.error && <div className="form-error">{status.error}</div>}
            {status?.success && <div className="form-success">{status.success}</div>}

            <button type="submit" className="contact-send-button">
              Send message <ArrowRightIcon className="icon-xs" />
            </button>
          </form>
        </div>

        {/* Sidebar Info */}
        <div className="contact-sidebar">
          <div className="contact-info-card">
            <h3>Other ways to reach us</h3>
            <div className="contact-methods">
              <div className="contact-method">
                <div className="contact-icon-circle">
                  <MailIcon className="icon-sm" />
                </div>
                <div className="method-details">
                  <p>Email</p>
                  <p className='contact-items'>info@e3os.com</p>
                </div>
              </div>

              <div className="contact-method">
                <div className="contact-icon-circle">
                  <PhoneIcon className="icon-sm" />
                </div>
                <div className="method-details">
                  <p>Phone</p>
                  <p className='contact-items'>0330 124 6524</p>
                </div>
              </div>

              <div className="contact-method">
                <div className="contact-icon-circle">
                  <MapPinIcon className="icon-sm" />
                </div>
                <div className="method-details">
                  <p>Office</p>
                  <p className='contact-items'>Unit 8&9 Church Farm Court, Capenhurst Lane, Chester, United Kingdom, CH1 6HE</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        <SupportChat />
      </section>
  
    </div>
  );
};

export default Contact;
