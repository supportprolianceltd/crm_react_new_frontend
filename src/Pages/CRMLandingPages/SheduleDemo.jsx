import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from 'react-router-dom';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 50 },
  },
};

const SheduleDemo = ({ selectedSlot, onSuccess }) => {
  // Initialize form state with default values
  const [formData, setFormData] = useState({
    name: "Ndubuisi Prince Godson",
    email: "princegodson24@gmail.com",
    phone: "09037494084",
    message: "Thank you for the opportunity to explore your product. I'd like to confirm the demo for Tuesday, June 11th at 2:00 PM (GMT+1)."
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef(null);

  // Adjust textarea height based on content
  const adjustHeight = () => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = ta.scrollHeight + "px";
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [formData.message]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Simulate API request
      setTimeout(() => {
        setIsSubmitting(false);
        onSuccess(); // Trigger success callback
      }, 1500);
    }
  };

  const details = [
    { label: "Full Name", value: formData.name, name: "name", editable: true },
    { label: "Email", value: formData.email, name: "email", editable: true },
    { label: "Phone Number", value: formData.phone, name: "phone", editable: true },
    { 
      label: "Demo Schedule Date", 
      value: selectedSlot 
        ? new Date(selectedSlot.formattedDate).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })
        : "Tuesday, June 11, 2025",
      editable: false 
    },
    { 
      label: "Demo Schedule Time", 
      value: selectedSlot ? selectedSlot.formattedTime : "3:49 AM",
      editable: false 
    },
    { label: "Status", value: "Available", editable: false },
  ];

  return (
    <div className="schedule-Secc">
      <form onSubmit={handleSubmit} className="schedule-Main">
        <motion.div
          className="animated-labels"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {details.map((item, index) => (
            <div className="schedule-Part" key={index}>
              <div className="schedule-Part-1">
                <motion.span variants={itemVariants}>{item.label}</motion.span>
              </div>
              <div className="schedule-Part-2">
                {item.editable ? (
                  <div className="editable-field">
                    <input
                      type="text"
                      name={item.name}
                      value={item.value}
                      onChange={handleChange}
                      className={errors[item.name] ? "error-input" : ""}
                    />
                    {errors[item.name] && (
                      <div className="error-message">{errors[item.name]}</div>
                    )}
                  </div>
                ) : (
                  <div className="status-container" style={{ display: 'flex', alignItems: 'center' }}>
                    <p>{item.value}</p>
                    {item.label === "Status" && item.value === "Available" && (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#7226FF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ marginLeft: '8px' }}
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          <div className="schedule-Part">
            <div className="schedule-Part-1">
              <motion.span variants={itemVariants}>Request Message</motion.span>
            </div>
            <div className="schedule-Part-2">
              <textarea
                ref={textareaRef}
                name="message"
                value={formData.message}
                onChange={handleChange}
                style={{
                  overflow: "hidden",
                  resize: "none",
                  minHeight: "85px",
                  width: "100%",
                  fontSize: "13px",
                  padding: "15px",
                }}
                rows={1}
              />
            </div>
          </div>
        </motion.div>

        <div className="schedule-Part">
          <div className="schedule-Part-1"></div>
          <div className="schedule-Part-2 specil-pl">
            <button 
              type="submit" 
              className="send-req-btn btn-primary-bg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Request"}
            </button>
            <p>
              Schedule a personalized demo with our team to see how{" "}
              <Link to="/">our CRM</Link> can help meet your needs. Demos typically
              last 20-45 minutes and are tailored to your interests. Once booked,
              you'll receive a confirmation with all the meeting details.
            </p>
            <p>Need to reschedule? Just let us know at least 24 hours in advance.</p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SheduleDemo;