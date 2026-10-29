import React, { useState, useEffect } from "react";
import { Table, Card, Button, Badge } from "react-bootstrap";
import api from "../../interceptors/axiosInterceptor";
import BASE_URL from "../../Config";
import jsPDF from "jspdf";
import html2canvas from 'html2canvas';
import PaymentFormModal from "../../authtication/PaymentFormModal";

const Payment = () => {
  const [payments, setPayments] = useState([]);
  const [studentFees, setStudentFees] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");

  // 👇 for Enroll Now Modal
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  const user = JSON.parse(localStorage.getItem("login_detail"));
  const studentId = localStorage.getItem("student_id");

  const fetchPayments = async () => {
    try {
      const response = await api.get(`${BASE_URL}paymentsbyid/${studentId}`);
      if (response?.data) {
        const allPayments = response.data;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Assign computed status to each payment
        const enriched = allPayments.map((p) => {
          const paymentDate = new Date(p.payment_date);
          paymentDate.setHours(0, 0, 0, 0);

          let computedStatus;
          if (paymentDate < today) {
            computedStatus = "Paid";
          } else if (paymentDate >= today) {
            // Check if overdue: due date passed but not paid
            computedStatus = "Pending";
          }
          // Overdue: if original status is pending/due AND date is past
          if (p.payment_status === "pending" && paymentDate < today) {
            computedStatus = "Overdue";
          }
          if (p.payment_status === "Approved" || p.payment_status === "paid") {
            computedStatus = "Paid";
          }

          return { ...p, computedStatus };
        });

        setPayments(enriched);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  useEffect(() => {
    if (studentId) fetchPayments();
  }, [studentId]);

  // Download Receipt
  const handleDownload = async (item) => {
    const invoiceHtml = `
      <div style="font-family: Arial, sans-serif; padding: 30px; max-width: 1000px; margin: 0 auto; border: 1px solid #ddd; background-color: #fff; color: #000000;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #ddd; padding-bottom: 15px;">
          <h1 style="text-align: center; font-size: 28px; margin: 0; flex-grow: 1; color: #000000;">INVOICE</h1>
          <img src="/img/kiaan_logo.png" alt="Kiaan Technology" height="100">
        </div>
        
        <div style="margin-bottom: 25px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <p style="font-size: 16px; margin: 5px 0; color: #0f0707ff;"><strong>Student Name:</strong> ${item.student_name_from_id}</p>
          <p style="font-size: 16px; margin: 5px 0; color: #0f0707ff;"><strong>Email:</strong> ${user?.email || 'N/A'}</p>
          <p style="font-size: 16px; margin: 5px 0; color: #0f0707ff;"><strong>Payment Date:</strong> ${new Date(item.payment_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
          <p style="font-size: 16px; margin: 5px 0; color: #0f0707ff;"><strong>Generated Time:</strong> ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}, ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; color: #333333;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-size: 16px; color: #000000;">Description</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: right; font-size: 16px; color: #000000;">Amount (BDT)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #ddd; padding: 12px; font-size: 15px;">Payment Amount</td>
              <td style="border: 1px solid #ddd; padding: 12px; text-align: right; font-size: 15px;">${item.payment_amount}.00</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 12px; font-size: 15px;">Tax</td>
              <td style="border: 1px solid #ddd; padding: 12px; text-align: right; font-size: 15px;">${item.tax}.00</td>
            </tr>
            <tr style="background-color: #f8f9fa; font-weight: bold;">
              <td style="border: 1px solid #ddd; padding: 12px; font-size: 16px;">Total</td>
              <td style="border: 1px solid #ddd; padding: 12px; text-align: right; font-size: 16px;">${item.total}.00</td>
            </tr>
          </tbody>
        </table>
        
        <div style="margin-bottom: 25px;">
          <p style="font-size: 16px; margin: 5px 0; color: #0a0909ff;"><strong>Notes:</strong> ${item.additional_notes || ''}</p>
        </div>
        
        <p style="text-align: center; font-size: 18px; margin-top: 40px; font-weight: 500; color: #000000;">Thank you for your payment!</p>
      </div>
    `;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = invoiceHtml;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);
    
    try {
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        logging: false,
        width: 1000,
        windowWidth: 1000,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfPageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pdfPageWidth * 0.9;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      const x = (pdfPageWidth - imgWidth) / 2;
      const y = 15;
      
      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      pdf.save(`Invoice_${item.invoice_id}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      document.body.removeChild(tempDiv);
    }
  };

  useEffect(() => {
    const fetchStudentFees = async () => {
      try {
        const response = await api.get(`getStudentFeesByUser/${studentId}`);
        setStudentFees(response.data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching student fees:", err);
      } finally {
        setLoading(false);
      }
    };
    if (studentId) fetchStudentFees();
  }, [studentId]);

  // Filter payments based on active filter
  const filteredPayments = payments.filter((p) => {
    if (activeFilter === "All") return true;
    return p.computedStatus === activeFilter;
  });

  // Counts for badges
  const paymentCounts = {
    All: payments.length,
    Pending: payments.filter((p) => p.computedStatus === "Pending").length,
    Paid: payments.filter((p) => p.computedStatus === "Paid").length,
    Overdue: payments.filter((p) => p.computedStatus === "Overdue").length,
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Paid": return <Badge bg="success">Paid</Badge>;
      case "Pending": return <Badge bg="warning" text="dark">Pending</Badge>;
      case "Overdue": return <Badge bg="danger">Overdue</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Payments & Invoices</h2>
        <div>
          <button
            className="btn btn-primary"
            onClick={() => setShowEnrollModal(true)}
          >
            Enroll now
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {["All", "Pending", "Paid", "Overdue"].map((filter) => (
          <Button
            key={filter}
            size="sm"
            variant={activeFilter === filter ? (
              filter === "Overdue" ? "danger" :
              filter === "Paid" ? "success" :
              filter === "Pending" ? "warning" : "primary"
            ) : "outline-secondary"}
            onClick={() => setActiveFilter(filter)}
            style={{ borderRadius: "20px", padding: "6px 18px", fontWeight: 500 }}
          >
            {filter}{" "}
            <Badge
              bg={activeFilter === filter ? "light" : "secondary"}
              text={activeFilter === filter ? "dark" : "light"}
              pill
              className="ms-1"
            >
              {paymentCounts[filter]}
            </Badge>
          </Button>
        ))}
      </div>

      <Card>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Payment Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.student_name_from_id || "N/A"}</td>
                    <td>{user?.email || 'N/A'}</td>
                    <td>{item.additional_notes}</td>
                    <td>৳{item.total}</td>
                    <td>
                      {item.payment_date
                        ? new Date(item.payment_date).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>{getStatusBadge(item.computedStatus)}</td>
                    <td>
                      {item.computedStatus === "Paid" && (
                        <Button
                          variant="info"
                          size="sm"
                          onClick={() => handleDownload(item)}
                        >
                          Download Receipt
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">
                    No {activeFilter !== "All" ? activeFilter.toLowerCase() : ""} payments found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Enroll Now Modal */}
      <PaymentFormModal
        show={showEnrollModal}
        handleClose={() => setShowEnrollModal(false)}
        studentId={studentId}
      />
    </div>
  );
};
 
export default Payment;




// import React, { useState, useEffect } from "react";
// import {
//   Container,
//   Tab,
//   Tabs,
//   Table,
//   Card,
//   Button,
//   Modal,
//   Alert,
//   Badge,
// } from "react-bootstrap";
// import api from "../../interceptors/axiosInterceptor";
// import BASE_URL from "../../Config";
// import jsPDF from "jspdf";
// import { FaVolumeHigh } from "react-icons/fa6";
// // import logo from "https://apply.studyfirstinfo.com/img/logo.png";
// const Payment = () => {
//   const [key, setKey] = useState("due");
//   const [showModal, setShowModal] = useState(false);
//   const [selectedPayment, setSelectedPayment] = useState(null);
//   const [payments, setPayments] = useState([]);
//   const [dedline, setdedline] = useState([]);

//   const [studentFees, setStudentFees] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   // Static data for Upcoming Deadlines tab
// const [paidTransactions, setpaidTransactions] = useState([]);

//   const user = JSON.parse(localStorage.getItem("login_detail"));
//   const studentId = localStorage.getItem("student_id")
//   const userId = localStorage.getItem("user_id")
 
//   const fetchPayments = async () => {
//     try {
//       const response = await api.get(`${BASE_URL}paymentsbyid/${studentId}`);

//       if (response?.data) {
//         const filterPay = response?.data?.filter((res) => res.payment_status !== "paid")
//         setPayments(response?.data);
//         setpaidTransactions(filterPay)
//       }
//     } catch (error) {
//       console.error("Error fetching payments:", error);
//     }
//   };


// const statusUpdate = async (payment) => {
//   try {
//     await api.patch(`${BASE_URL}payment_status/${payment.id}`, {
//       payment_status: "paid",
//     });

//     // Move to paid list
//     setPayments((prev) => [
//       ...prev,
//       {
//         ...payment,
//         updated_at: new Date().toISOString(), // update paid date
//       },
//     ]);

//     // Remove from due (unpaid) list
//     setPaidTransactions((prev) =>
//       prev.filter((item) => item.id !== payment.id)
//     );

    
//   } catch (error) {
//     console.error(error);
//     alert("❌ Failed to update payment status.");
//   }
// };



//   useEffect(() => {
//     if (user?.email) fetchPayments(user.email);
//   }, [user?.email]);

//   // Helper function for countdown (example)
//   const getCountdown = (deadline) => {
//     const now = new Date();
//     const end = new Date(deadline);
//     const diff = end - now;

//     if (diff <= 0) return "Deadline passed";

//     const days = Math.floor(diff / (1000 * 60 * 60 * 24));
//     const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
//     const minutes = Math.floor((diff / (1000 * 60)) % 60);

//     return `${days}d ${hours}h ${minutes}m left`;
//   };

//   // Generate and download the receipt PDF
//   const handleDownload = (item) => {
//     const doc = new jsPDF();

//     // Set up the logo
//     // doc.addImage("https://apply.studyfirstinfo.com/img/logo.png", 10, 10, 50, 30);

//     // Set up the title and invoice details
//     doc.setFontSize(16);
//     doc.text("Invoice", 100, 20);

//     doc.setFontSize(12);
//     doc.text(`Invoice Number: ${item.id}`, 10, 50);
//     doc.text(`Student Name: ${item.name}`, 10, 60);
//     doc.text(`Email: ${item.email}`, 10, 70);
//     doc.text(`Amount: $${item.total}`, 10, 80);
//     doc.text(`Payment Method: ${item.payment_method}`, 10, 90);
//     doc.text(`Payment Date: ${new Date(item.payment_date).toLocaleDateString()}`, 10, 100);
//     doc.text(`Notes: ${item.additional_notes}`, 10, 110);

//     // Add a footer or additional information
//     doc.text("Thank you for your payment!", 10, 130);

//     // Save the PDF
//     doc.save(`Invoice_${item.id}.pdf`);
//   };

 
//  useEffect(() => {
//   const fetchStudentFees = async () => {
//     try {
//       const response = await api.get(`getStudentFeesByUser/${studentId}`);
//       console.log("Student Fees Data:", response); // Log the response data to console
//       setStudentFees(response.data); // Update the state with the fetched data
//     } catch (err) {
//       setError(err.message);
//       console.error("Error fetching student fees:", err); // Log the error to console
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchStudentFees();
// }, []); // Empty array ensures it runs only once when the component mounts

//   if (loading) return <div>Loading...</div>;
//   // if (error) return <div>Error: {error}</div>;

//   return (
//     <Container className="mt-4">


//       <Card>
//         <Card.Body>
//           <h4 className="mb-4">Create new payment</h4>
//           <Tabs
//             id="payment-tabs"
//             activeKey={key}
//             onSelect={(k) => setKey(k)}
//             className="mb-3"
//           >
//             {/* Due Payments Tab */}
//             <Tab eventKey="due" title="Payments">
//               <Table striped bordered hover responsive>
//                 <thead>
//                   <tr>
//                     <th>#</th>
//                     <th>Email</th>
//                     <th>Description</th>

//                     <th>Amount</th>
//                     <th>Due Date</th>
//                     <th>Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {paidTransactions?.map((item, index) => (
//                     <tr key={index}>
//                       <td>{index + 1}</td>
//                       <td>{item?.email}</td>
//                       <td>{item?.additional_notes}</td>

//                       <td>${item?.total}</td>
//                       <td>{item?.payment_date}</td>
//                       <td>
//                         {/* <button className="btn btn-primary me-3">View Details</button> */}
//                         <button
//                           className="btn btn-success"
//                           onClick={() => statusUpdate(item)}
//                         >
//                           Pay now
//                         </button>

//                       </td>


//                     </tr>
//                   ))}
//                 </tbody>
//               </Table>
//             </Tab>

//             {/* Paid Transactions Tab */}
//             <Tab eventKey="paid" title="Paid Transactions">
//               <Table striped bordered hover responsive>
//                 <thead>
//                   <tr>
//                     <th>Name</th>
//                     <th>Email</th>
//                     <th>Description</th>
//                     <th>Amount</th>
//                     <th>Paid On</th>
//                     <th>Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {payments.map((item, index) => (
//                     <tr key={index}>
//                       <td>{item.name}</td>
//                       <td>{item.email}</td>
//                       <td>{item.additional_notes}</td>
//                       <td>${item.total}</td>
//                 <td>{new Date(item.updated_at).toDateString()}</td>

//                       <td>
//                         <Button variant="info" size="sm" onClick={() => handleDownload(item)}>
//                           Download Receipt
//                         </Button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </Table>
//             </Tab>

       

//           </Tabs>
//         </Card.Body>
//       </Card>





//       {/* Pay Now Modal */}
//       <Modal show={showModal} onHide={() => setShowModal(false)} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>Confirm Payment</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedPayment && (
//             <>
//               <p>
//                 <strong>Description:</strong> {selectedPayment.description}
//               </p>
//               <p>
//                 <strong>Amount:</strong> {selectedPayment.amount}
//               </p>
//               <p>
//                 <strong>Due Date:</strong> {selectedPayment.dueDate}
//               </p>
//               <hr />
//               <p>Proceed to payment gateway?</p>
//             </>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowModal(false)}>
//             Cancel
//           </Button>
//           <Button
//             variant="success"
//             onClick={() => {
//               setShowModal(false);
//               alert("Payment successful!");
//             }}
//           >
//             Pay Now
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </Container>
//   );
// };

// export default Payment;