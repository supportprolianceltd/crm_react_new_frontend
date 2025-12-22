import React, { useState } from 'react'
import usePageTitle from "../../hooks/usecrmPageTitle";
import { ArrowRightIcon, CheckCircle2, ChevronRight, MailIcon, MapPinIcon, PhoneIcon, Play } from "lucide-react";
import "./BookDemo.css"
import SupportChat from './SupportChat';

const BookDemo = () => {
     usePageTitle();
     const [form, setForm] = useState({
       firstName: "",
       lastName: "",
       email: "",
       companySize: "",
       orgType: "",
       numClients: "",
       hearAbout: "",
     });
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
         // fallback to mail client
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
       if (!form.firstName || !form.email) {
         setStatus({ error: 'Please fill required fields (First name, Work email).' });
         return;
       }

       const subject = `Demo request from ${form.firstName} ${form.lastName}`;
       const body = `First Name: ${form.firstName}\nLast Name: ${form.lastName}\nEmail: ${form.email}\nCompany Size: ${form.companySize}\nOrganization Type: ${form.orgType}\nNumber of Clients: ${form.numClients}\nHeard About: ${form.hearAbout}`;

       const result = await sendMail({ to: 'info@e3os.com', subject, body });
       if (result.success) {
         setStatus({ success: 'Request sent — we will contact you shortly.' });
         setForm({ firstName: '', lastName: '', email: '', companySize: '', orgType: '', numClients: '', hearAbout: '' });
       } else {
         setStatus({ success: 'Opened mail client — please send to complete.' });
       }
     };

  return (
     <div className="book-contact-page">
      {/* Header Section */}
      <section className="book-contact-header">
        <h1>Experience E3OS in Action</h1>
        <p>
         Experience a personalized product demo and get all your questions answered by our experts.
        </p>
      </section>

      {/* Content Section */}
      <section className="book-contact-content">
        {/* book-Contact book-Form */}
        <div className="book-contact-book-form-card">
          {/* <h3>Send us a message</h3> */}
          
          <form onSubmit={handleSubmit}>
            
            <div className="book-form-group-row">
              <div>
                <small>First Name*</small>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className="book-form-input"
                />
              </div>
              <div>
                <small>Last Name*</small>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className="book-form-input"
                />
              </div>
            </div>

            <div className="book-form-group-row">
              <div>
                <small>Work Email*</small>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="book-form-input"
                />
              </div>
              <div>
                <small>Company Size*</small>
                <input
                  type="text"
                  name="companySize"
                  value={form.companySize}
                  onChange={handleChange}
                  className="book-form-input"
                />
              </div>
            </div>

            <div className="book-form-group-row">
              <div>
                <small>Organization Type*</small>
                <input
                  type="text"
                  name="orgType"
                  value={form.orgType}
                  onChange={handleChange}
                  className="book-form-input"
                />
              </div>
              <div>
                <small>How many number of clients do you have?*</small>
                <input
                  type="text"
                  name="numClients"
                  value={form.numClients}
                  onChange={handleChange}
                  className="book-form-input"
                />
              </div>
            </div>

            <div className="book-form-group-single">
              <small>How did you hear about E3OS*</small>  
              <input
                type="text"
                name="hearAbout"
                value={form.hearAbout}
                onChange={handleChange}
                className="book-form-input"
              />
            </div>

            {status?.error && <div className="form-error">{status.error}</div>}
            {status?.success && <div className="form-success">{status.success}</div>}

            <p className='book-demo-endnote'>
              E3OS needs the book-contact inbook-formation you provide to us to respond to your query and will also use it to book-contact you about our products and services. By submitting this book-form, you agree that we will book-contact you in relation to our products and services, in accordance with our 
              <span className='endnote-purp'> privacy policy.</span>
            </p>

             <button type="submit" className="book-confirm-button">
               Send request for demo
              </button>  

            {/* <div className='book-buttons'>
                <button type="button" className="book-confirm-button">
                 Send request for demo
                </button>            
                
                <button type="button" className="book-close-button">
                 Close
                </button>
            </div> */}
          </form>
        </div>

        <SupportChat />
      </section>
  
    </div>
  )
}

export default BookDemo