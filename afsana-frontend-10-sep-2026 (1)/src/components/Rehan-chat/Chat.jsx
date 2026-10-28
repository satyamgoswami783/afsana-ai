// import React, { useEffect, useRef, useState } from 'react';
// import { Modal, Button, Form } from 'react-bootstrap';
// import Select from 'react-select';
// import io from 'socket.io-client';
// import axios from 'axios';
// import './Chat.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import BASE_URL from '../../Config';

// // const Socket_URL = "https://afsana-backend-production.up.railway.app/";
// const Socket_URL = "https://afsana-backend-production-0897.up.railway.app/";
// const socket = io(Socket_URL, { transports: ['websocket'] });

// const ChatAppLayout = () => {
//     const [users, setUsers] = useState([]);
//     const [groups, setGroups] = useState([]);
//     const [allChats, setAllChats] = useState([]);
//     const [selectedChat, setSelectedChat] = useState(null);
//     const [chatHistory, setChatHistory] = useState([]);
//     const [message, setMessage] = useState('');
//     const [showGroupModal, setShowGroupModal] = useState(false);
//     const [groupName, setGroupName] = useState('');
//     const [groupMembers, setGroupMembers] = useState([]);
//     const [showSidebar, setShowSidebar] = useState(window.innerWidth > 768);
//     const messagesEndRef = useRef(null);

//     const currentUserId = localStorage.getItem("user_id");
//     const currentCId = localStorage.getItem("counselor_id");
//     const currentUserRole = localStorage.getItem("role");
//     const student_id = localStorage.getItem("student_id");

//     useEffect(() => {
//         const handleResize = () => {
//             setShowSidebar(window.innerWidth > 768);
//         };

//         window.addEventListener('resize', handleResize);
//         return () => window.removeEventListener('resize', handleResize);
//     }, []);

//     const getCurrentRoleWiseId = () => {
//         if (currentUserRole === "student") return student_id;
//         if (currentUserRole === "counselor") return currentCId;
//         return currentUserId;
//     };

//     useEffect(() => {
//         const userId = getCurrentRoleWiseId();
//         if (userId) socket.emit("join", userId);
//     }, []);

//     useEffect(() => {
//         const fetchData = async () => {
//             if (currentUserRole === "counselor") await fetchgetAssignedStudents();
//             else if (currentUserRole === "student") await fetchgetAssignedcounselor();
//             else await fetchUserDetails();
//         };
//         fetchData();
//     }, []);

//     useEffect(() => {
//         socket.on('messages', setChatHistory);
//         socket.on('new_message', msg => {
//             const currentId = getCurrentRoleWiseId();
//             if (msg.group_id || msg.sender_id === currentId || msg.receiver_id === currentId) {
//                 setChatHistory(prev => [...prev, msg]);
//                 fetchUserDetails();
//             }
//         });

//         return () => {
//             socket.off('messages');
//             socket.off('new_message');
//         };
//     }, []);

//     useEffect(() => {
//         messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//     }, [chatHistory]);

//     const fetchUserDetails = async () => {
//         try {
//             const res = await axios.get(`${BASE_URL}userdetails?userId=${currentUserId}`);
//             const fetchedUsers = (res.data.users || []).map(u => ({ ...u, type: 'user' }));
//             const fetchedGroups = (res.data.groups || []).map(g => ({ ...g, type: 'group' }));
//             const merged = [...fetchedUsers, ...fetchedGroups].sort((a, b) => {
//                 return new Date(b.last_message_time) - new Date(a.last_message_time);
//             });
//             setUsers(fetchedUsers);
//             setGroups(fetchedGroups);
//             setAllChats(merged);

//         } catch (err) {
//             console.error('User/Group fetch error:', err);
//         }
//     };

//     const formatDateLabel = (dateStr) => {
//         const date = new Date(dateStr);
//         const today = new Date();
//         const yesterday = new Date();
//         yesterday.setDate(today.getDate() - 1);

//         const isSameDay = (d1, d2) =>
//             d1.getFullYear() === d2.getFullYear() &&
//             d1.getMonth() === d2.getMonth() &&
//             d1.getDate() === d2.getDate();

//         if (isSameDay(date, today)) return "Today";
//         if (isSameDay(date, yesterday)) return "Yesterday";

//         return date.toLocaleDateString('en-US', {
//             day: 'numeric',
//             month: 'short',
//             year: 'numeric'
//         });
//     };

//     const fetchgetAssignedStudents = async () => {
//         try {
//             const res = await axios.get(`${BASE_URL}getAssignedStudents?counselor_id=${currentCId}`);
//             const fetchedUsers = (res.data.users || []).map(u => ({ ...u, type: 'user' }));
//             const fetchedGroups = (res.data.groups || []).map(g => ({ ...g, type: 'group' }));
//             const merged = [...fetchedUsers, ...fetchedGroups].sort((a, b) => {
//                 return new Date(b.last_message_time) - new Date(a.last_message_time);
//             });
//             setUsers(fetchedUsers);
//             setGroups(fetchedGroups);
//             setAllChats(merged);

//         } catch (err) {
//             console.error('User/Group fetch error:', err);
//         }
//     };

//     const fetchgetAssignedcounselor = async () => {
//         try {
//             const res = await axios.get(`${BASE_URL}getAssignedcounselor?student_id=${student_id}`);
//             const fetchedUsers = (res.data.users || []).map(u => ({ ...u, type: 'user' }));
//             const fetchedGroups = (res.data.groups || []).map(g => ({ ...g, type: 'group' }));

//             const merged = [...fetchedUsers, ...fetchedGroups].sort((a, b) => {
//                 return new Date(b.last_message_time) - new Date(a.last_message_time);
//             });
//             setUsers(fetchedUsers);
//             setGroups(fetchedGroups);
//             setAllChats(merged);

//         } catch (err) {
//             console.error('User/Group fetch error:', err);
//         }
//     };

//     const openChat = (chat) => {
//         setSelectedChat(chat);
//         setChatHistory([]);

//         const sender_id = getCurrentRoleWiseId();
//         let receiver_id = null;
//         let group_id = null;

//         if (chat.type === 'group') {
//             group_id = chat.id;
//             socket.emit("join", chat.id);
//         } else {
//             if (currentUserRole === 'admin') {
//                 receiver_id = chat.student_id || chat.counselor_id || chat.id;
//             } else if (currentUserRole === 'counselor') {
//                 receiver_id = chat.student_id || chat.id;
//             } else if (currentUserRole === 'student') {
//                 receiver_id = chat.counselor_id || chat.id;
//             } else {
//                 receiver_id = chat.id;
//             }
//         }

//         const payload = group_id ? { group_id } : { sender_id, receiver_id };
//         socket.emit('get_messages', payload);

//         if (window.innerWidth <= 768) {
//             setShowSidebar(false);
//         }
//     };

//     const deleteGroup = async (groupId) => {
//         try {
//             const res = await axios.delete(`${BASE_URL}deletegroup/${groupId}`);
//             if (res.data.success) {
//                 alert("Group deleted successfully");
//                 fetchUserDetails();
//                 if (selectedChat?.id === groupId) {
//                     setSelectedChat(null);
//                     setChatHistory([]);
//                 }
//             }
//         } catch (err) {
//             console.error("Group delete failed", err);
//             alert("You are not authorized to delete this group");
//         }
//     };

//     const handleSendMessage = () => {
//         if (!message.trim() || !selectedChat) return;

//         const sender_id = getCurrentRoleWiseId();
//         let receiver_id = null;
//         let group_id = null;

//         if (selectedChat.type === 'group') {
//             group_id = selectedChat.id;
//         } else {
//             if (currentUserRole === 'admin') {
//                 receiver_id = selectedChat.student_id || selectedChat.counselor_id || selectedChat.id;
//             } else if (currentUserRole === 'counselor') {
//                 receiver_id = selectedChat.student_id || selectedChat.id;
//             } else if (currentUserRole === 'student') {
//                 receiver_id = selectedChat.counselor_id || selectedChat.id;
//             } else {
//                 receiver_id = selectedChat.id;
//             }
//         }

//         const payload = {
//             message,
//             sender_id,
//             type: 'text',
//             group_id,
//             receiver_id: selectedChat.type === 'user' ? receiver_id : null,
//         };

//         socket.emit('send_message', payload);
//         setMessage('');
//     };

//     const handleCreateGroup = async () => {
//         try {
//             const roleWiseId = getCurrentRoleWiseId();
//             const selectedIds = groupMembers.map(u => u.value);

//             if (!selectedIds.includes(1)) selectedIds.push(1);

//             const payload = {
//                 group_name: groupName,
//                 user_ids: selectedIds.join(','),
//                 created_by: roleWiseId,
//             };

//             await axios.post(`${BASE_URL}creategroup`, payload);
//             setShowGroupModal(false);
//             setGroupName('');
//             setGroupMembers([]);
//             fetchUserDetails();
//         } catch (err) {
//             console.error('Create group failed:', err);
//         }
//     };

//     const userOptions = users?.map(u => ({ value: u.id, label: u.full_name }));

//     return (
//         <div className="d-flex flex-column vh-100">
//             {/* Mobile header */}
//             <div className="d-flex d-md-none align-items-center p-2 bg-light border-bottom">
//                 <Button
//                     variant="light"
//                     onClick={() => setShowSidebar(!showSidebar)}
//                     className="me-2"
//                 >
//                     {showSidebar ? '✕' : '☰'}
//                 </Button>
//                 <h5 className="mb-0 text-truncate">
//                     {selectedChat ?
//                         `Chat with ${selectedChat.type === 'group' ? selectedChat.group_name : selectedChat.full_name}` :
//                         'Messaging'}
//                 </h5>
//             </div>

//             <div className="d-flex flex-grow-1 overflow-hidden">
//                 {/* Sidebar */}
//                 <div
//                     className={`chat-sidebar border-end p-3 bg-light ${showSidebar ? 'd-block' : 'd-none'} d-md-block`}
//                 >
//                     <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 mb-3">
//                         <h5 className="fw-bold mb-0">Chats</h5>
//                         <Button
//                             variant="primary"
//                             size="sm"
//                             className="ms-sm-auto"
//                             onClick={() => setShowGroupModal(true)}
//                         >
//                             + Group
//                         </Button>
//                     </div>


//                     {allChats.map((chat) => (
//                         <div
//                             key={`${chat.type}-${chat.id}`}
//                             className={`p-2 mb-2 rounded ${selectedChat?.id === chat.id && selectedChat?.type === chat.type ? 'border border-success bg-primary text-white' : 'bg-white'}`}
//                             onClick={() => openChat(chat)}
//                             style={{ cursor: 'pointer' }}
//                         >
//                             <div className="d-flex align-items-center justify-content-between">
//                                 <div className="d-flex align-items-center">
//                                     <div className="me-2 fs-4">{chat.type === 'user' ? '👤' : '👥'}</div>
//                                     <div>
//                                         <div className="fw-bold text-truncate" style={{ maxWidth: '150px' }}>
//                                             {chat.type === 'user' && chat.id === currentUserId ? 'You' : `${chat.full_name || chat.group_name} ${chat.type === "user" ? `(${chat?.role})` : ""}`}
//                                         </div>
//                                         <div className="small">{chat.type}</div>
//                                     </div>
//                                 </div>

//                                 {currentUserId == 1 && chat?.group_name && (
//                                     <Button variant="danger" size="sm" onClick={(e) => {
//                                         e.stopPropagation();
//                                         deleteGroup(chat.id);
//                                     }}>🗑️</Button>
//                                 )}
//                             </div>
//                         </div>
//                     ))}
//                 </div>

//                 {/* Chat area */}
//                 <div className="d-flex flex-column flex-grow-1">
//                     {selectedChat ? (
//                         <>
//                             <div className="d-none d-md-flex px-4 py-3 border-bottom">
//                                 <h5 className="mb-0">
//                                     Chat with {selectedChat.type === 'group' ? selectedChat.group_name : selectedChat.full_name}
//                                 </h5>
//                             </div>
//                             <div className="flex-grow-1 overflow-auto p-3">
//                                 {(() => {
//                                     let lastDate = null;

//                                     return chatHistory.map((msg, idx) => {
//                                         const messageDate = new Date(msg.created_at);
//                                         const formattedDate = formatDateLabel(messageDate);

//                                         const isNewDate = !lastDate || new Date(lastDate).toDateString() !== messageDate.toDateString();
//                                         lastDate = messageDate;

//                                         const isSender = String(msg.sender_id) === String(getCurrentRoleWiseId());

//                                         return (
//                                             <React.Fragment key={idx}>
//                                                 {isNewDate && (
//                                                     <div className="text-center my-2">
//                                                         <span className="badge bg-secondary">{formattedDate}</span>
//                                                     </div>
//                                                 )}
//                                                 <div
//                                                     className={`p-3 mb-2 rounded ${isSender ? 'bg-primary text-white ms-auto' : 'bg-light me-auto'}`}
//                                                     style={{
//                                                         maxWidth: '60%',        // limit max width to 60%
//                                                         width: 'fit-content',   // shrink to content
//                                                         wordBreak: 'break-word' // break long words
//                                                     }}
//                                                 >
//                                                     <div>{msg.message}</div>
//                                                     <div className={`small ${isSender ? 'text-white-50' : 'text-muted'}`}>
//                                                         <strong>{!isSender ? `${msg.full_name || 'Unknown'}, ` : ''}</strong>
//                                                         {new Date(msg.created_at).toLocaleTimeString('en-US', {
//                                                             hour: 'numeric',
//                                                             minute: '2-digit',
//                                                             hour12: true
//                                                         })}
//                                                     </div>
//                                                 </div>
//                                             </React.Fragment>
//                                         );
//                                     });
//                                 })()}

//                                 <div ref={messagesEndRef} />
//                             </div>
//                             <div className="border-top p-3 d-flex">
//                                 <input
//                                     className="form-control me-2"
//                                     placeholder="Type your message..."
//                                     value={message}
//                                     onChange={(e) => setMessage(e.target.value)}
//                                     onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
//                                 />
//                                 <Button variant="primary" disabled={!message.trim()} onClick={handleSendMessage}>Send</Button>
//                             </div>
//                         </>
//                     ) : (
//                         <div className="d-flex justify-content-center align-items-center h-100">
//                             <div className="text-center">
//                                 <h3>Welcome to Messaging 💬</h3>
//                                 <p>Select a user or group to start chatting.</p>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>

//             <Modal show={showGroupModal} onHide={() => setShowGroupModal(false)} centered>
//                 <Modal.Header closeButton>
//                     <Modal.Title>Create Group</Modal.Title>
//                 </Modal.Header>
//                 <Modal.Body>
//                     <Form>
//                         <Form.Group className="mb-3">
//                             <Form.Label>Group Name</Form.Label>
//                             <Form.Control
//                                 type="text"
//                                 placeholder="Enter group name"
//                                 value={groupName}
//                                 onChange={(e) => setGroupName(e.target.value)}
//                             />
//                         </Form.Group>
//                         <Form.Group>
//                             <Form.Label>Select Members</Form.Label>
//                             <Select
//                                 isMulti
//                                 options={userOptions}
//                                 value={groupMembers}
//                                 onChange={setGroupMembers}
//                             />
//                         </Form.Group>
//                     </Form>
//                 </Modal.Body>
//                 <Modal.Footer>
//                     <Button variant="secondary" onClick={() => setShowGroupModal(false)}>Cancel</Button>
//                     <Button variant="primary" onClick={handleCreateGroup}>Create</Button>
//                 </Modal.Footer>
//             </Modal>
//         </div>
//     );
// };

// export default ChatAppLayout;



import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Select from 'react-select';
import io from 'socket.io-client';
import axios from 'axios';
import './Chat.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import BASE_URL from '../../Config';

// const Socket_URL = "https://afsana-backend-production.up.railway.app/";
const Socket_URL = BASE_URL.replace("/api/", "/");
const socket = io(Socket_URL, { transports: ['websocket'] });

const ChatAppLayout = () => {
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [allChats, setAllChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);
    const [message, setMessage] = useState('');
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [groupMembers, setGroupMembers] = useState([]);
    const [showSidebar, setShowSidebar] = useState(window.innerWidth > 768);
    const [senderDetails, setSenderDetails] = useState({}); // New state to store sender details
    const [searchTerm, setSearchTerm] = useState(""); // Search bar state
    const messagesEndRef = useRef(null);

    const currentUserId = localStorage.getItem("user_id")?.trim();
    const currentCId = localStorage.getItem("counselor_id")?.trim();
    const currentUserRole = localStorage.getItem("role")?.trim();
    const student_id = localStorage.getItem("student_id")?.trim();

    useEffect(() => {
        const handleResize = () => {
            setShowSidebar(window.innerWidth > 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getCurrentRoleWiseId = () => {
        // ALWAYS use user_id for chat operations for consistency across all roles
        return currentUserId;
    };

    useEffect(() => {
        const userId = getCurrentRoleWiseId();
        if (userId) {
            socket.emit("registerUser", userId);
            socket.emit("join", userId); // for old support
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (currentUserRole === "counselor") await fetchgetAssignedStudents();
            else if (currentUserRole === "student") await fetchgetAssignedcounselor();
            else await fetchUserDetails();
        };
        fetchData();
    }, []);

    useEffect(() => {
        socket.on('chat_history', (data) => setChatHistory(data.messages || []));
        socket.on('receive_message', msg => {
            const currentId = String(getCurrentRoleWiseId());
            const msgSenderId = String(msg.sender_id);
            const msgReceiverId = String(msg.receiver_id);

            if (msg.group_id || msgSenderId === currentId || msgReceiverId === currentId) {
                // De-duplicate: only add if message ID doesn't already exist in history
                setChatHistory(prev => {
                    const isDuplicate = prev.some(m => m.id === msg.id);
                    if (isDuplicate) return prev;
                    return [...prev, msg];
                });
                
                // Optimistically move the contact to the top
                setAllChats(prev => {
                    const targetId = msg.group_id || (msgSenderId === currentId ? msgReceiverId : msgSenderId);
                    const targetType = msg.group_id ? 'group' : 'user';
                    
                    const index = prev.findIndex(c => String(c.id) === String(targetId) && c.type === targetType);
                    if (index === -1) return prev; // Contact not in list yet? fetch will handle it

                    const updated = [...prev];
                    const chat = { 
                        ...updated[index], 
                        last_message_time: new Date().toISOString(),
                        unread_count: (msgSenderId !== currentId && (!selectedChat || String(selectedChat.id) !== String(msgSenderId))) 
                                      ? (updated[index].unread_count || 0) + 1 
                                      : updated[index].unread_count
                    };
                    updated.splice(index, 1);
                    return [chat, ...updated];
                });

                // Refresh correctly based on role - Force update list from DB for final sync
                if (currentUserRole === "counselor") fetchgetAssignedStudents();
                else if (currentUserRole === "student") fetchgetAssignedcounselor();
                else fetchUserDetails();
            }
        });

        return () => {
            socket.off('chat_history');
            socket.off('receive_message');
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const fetchUserDetails = async () => {
        const userId = getCurrentRoleWiseId();
        if (!userId) {
            console.warn("Cannot fetch user details: userId is missing");
            return;
        }

        try {
            const res = await axios.get(`${BASE_URL}userdetails?userId=${userId}`);
            const fetchedUsers = (res.data.users || []).map(u => ({ ...u, type: 'user' }));
            const fetchedGroups = (res.data.groups || []).map(g => ({ ...g, type: 'group' }));
            const serverList = [...fetchedUsers, ...fetchedGroups];

            setAllChats(prevChats => {
                if (!prevChats || prevChats.length === 0) return serverList;

                return serverList.map(serverChat => {
                    const localChat = prevChats.find(c => String(c.id) === String(serverChat.id) && c.type === serverChat.type);
                    if (localChat) {
                        const localTime = localChat.last_message_time ? new Date(localChat.last_message_time).getTime() : 0;
                        const serverTime = serverChat.last_message_time ? new Date(serverChat.last_message_time).getTime() : 0;
                        
                        let finalUnread = serverChat.unread_count;
                        if (selectedChat && String(selectedChat.id) === String(serverChat.id) && selectedChat.type === serverChat.type) {
                            finalUnread = 0;
                        }

                        if (localTime > serverTime) {
                            return { ...serverChat, last_message_time: localChat.last_message_time, unread_count: finalUnread };
                        }
                        return { ...serverChat, unread_count: finalUnread };
                    }
                    return serverChat;
                });
            });

            setUsers(fetchedUsers);
            setGroups(fetchedGroups);

            const userDetailsMap = {};
            fetchedUsers.forEach(user => {
                userDetailsMap[user.id] = { full_name: user.full_name, role: user.role };
            });
            setSenderDetails(userDetailsMap);

        } catch (err) {
            console.error('User/Group fetch error:', err);
        }
    };

    const formatDateLabel = (dateStr) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const isSameDay = (d1, d2) =>
            d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();

        if (isSameDay(date, today)) return "Today";
        if (isSameDay(date, yesterday)) return "Yesterday";

        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const fetchgetAssignedStudents = async () => {
        try {
            const res = await axios.get(`${BASE_URL}getAssignedStudents?counselor_id=${currentCId}`);
            const fetchedUsers = (res.data.users || []).map(u => ({ ...u, type: 'user' }));
            const fetchedGroups = (res.data.groups || []).map(g => ({ ...g, type: 'group' }));
            const serverList = [...fetchedUsers, ...fetchedGroups];

            // Merge: keep local last_message_time if it's newer (protects optimistic updates)
            setAllChats(prevChats => {
                return serverList.map(serverChat => {
                    const localChat = prevChats.find(c => String(c.id) === String(serverChat.id) && c.type === serverChat.type);
                    if (localChat) {
                        const localTime = localChat.last_message_time ? new Date(localChat.last_message_time).getTime() : 0;
                        const serverTime = serverChat.last_message_time ? new Date(serverChat.last_message_time).getTime() : 0;
                        if (localTime > serverTime) {
                            return { ...serverChat, last_message_time: localChat.last_message_time };
                        }
                    }
                    return serverChat;
                });
            });

            setUsers(fetchedUsers);
            setGroups(fetchedGroups);

            // Create a mapping of user IDs to user details
            const userDetails = {};
            fetchedUsers.forEach(user => {
                userDetails[user.id] = { full_name: user.full_name, role: user.role };
            });
            setSenderDetails(userDetails);

        } catch (err) {
            console.error('User/Group fetch error:', err);
        }
    };

    const fetchgetAssignedcounselor = async () => {
        try {
            const res = await axios.get(`${BASE_URL}getAssignedcounselor?student_id=${student_id}`);
            const fetchedUsers = (res.data.users || []).map(u => ({ ...u, type: 'user' }));
            const fetchedGroups = (res.data.groups || []).map(g => ({ ...g, type: 'group' }));
            const serverList = [...fetchedUsers, ...fetchedGroups];

            // Merge: keep local last_message_time if it's newer (protects optimistic updates)
            setAllChats(prevChats => {
                return serverList.map(serverChat => {
                    const localChat = prevChats.find(c => String(c.id) === String(serverChat.id) && c.type === serverChat.type);
                    if (localChat) {
                        const localTime = localChat.last_message_time ? new Date(localChat.last_message_time).getTime() : 0;
                        const serverTime = serverChat.last_message_time ? new Date(serverChat.last_message_time).getTime() : 0;
                        if (localTime > serverTime) {
                            return { ...serverChat, last_message_time: localChat.last_message_time };
                        }
                    }
                    return serverChat;
                });
            });

            setUsers(fetchedUsers);
            setGroups(fetchedGroups);

            // Create a mapping of user IDs to user details
            const userDetails = {};
            fetchedUsers.forEach(user => {
                userDetails[user.id] = { full_name: user.full_name, role: user.role };
            });
            setSenderDetails(userDetails);

        } catch (err) {
            console.error('User/Group fetch error:', err);
        }
    };

    const openChat = (chat) => {
        setSelectedChat(chat);
        setChatHistory([]);

        const sender_id = getCurrentRoleWiseId();
        let receiver_id = null;
        let group_id = null;

        if (chat.type === 'group') {
            group_id = chat.id;
            socket.emit("join", chat.id);
        } else {
            // Standardize on chat.id (which is user_id from the backend response)
            receiver_id = chat.id;

            // Optimistically clear unread count
            setAllChats(prev => prev.map(c => 
                (c.id === chat.id && c.type === chat.type) ? { ...c, unread_count: 0 } : c
            ));

            // Mark as read in backend
            axios.post(`${BASE_URL}chats/markAsRead`, {
                userId: sender_id,
                otherUserId: receiver_id
            }).catch(err => console.error("Error marking as read:", err));
        }

        const payload = group_id ? { group_id } : { sender_id, receiver_id };
        socket.emit('get_chat_history', payload);
        socket.emit('joinRoom', { user_id: sender_id, other_user_id: receiver_id });

        if (window.innerWidth <= 768) {
            setShowSidebar(false);
        }
    };

    const deleteGroup = async (groupId) => {
        try {
            const res = await axios.delete(`${BASE_URL}deletegroup/${groupId}`);
            if (res.data.success) {
                alert("Group deleted successfully");
                fetchUserDetails();
                if (selectedChat?.id === groupId) {
                    setSelectedChat(null);
                    setChatHistory([]);
                }
            }
        } catch (err) {
            console.error("Group delete failed", err);
            alert("You are not authorized to delete this group");
        }
    };

    const handleSendMessage = () => {
        if (!message.trim() || !selectedChat) return;

        const sender_id = getCurrentRoleWiseId();
        let receiver_id = null;
        let group_id = null;

        if (selectedChat.type === 'group') {
            group_id = selectedChat.id;
        } else {
            // Standardize on selectedChat.id (user_id)
            receiver_id = selectedChat.id;
        }

        const payload = {
            message,
            sender_id,
            type: 'text',
            group_id,
            receiver_id: selectedChat.type === 'user' ? receiver_id : null,
        };

        socket.emit('send_message', payload);
        
        // Optimistically move the current chat to the top
        setAllChats(prev => {
            const currentChatIndex = prev.findIndex(c => 
                (String(c.id) === String(selectedChat.id) && c.type === selectedChat.type)
            );
            if (currentChatIndex === -1) return prev;
            
            const updated = [...prev];
            const chat = { ...updated[currentChatIndex], last_message_time: new Date().toISOString() };
            updated.splice(currentChatIndex, 1);
            return [chat, ...updated];
        });

        setMessage('');
    };

    const handleCreateGroup = async () => {
        try {
            const roleWiseId = getCurrentRoleWiseId();
            const selectedIds = groupMembers.map(u => u.value);

            if (!selectedIds.includes(1)) selectedIds.push(1);

            const payload = {
                group_name: groupName,
                user_ids: selectedIds.join(','),
                created_by: roleWiseId,
            };

            await axios.post(`${BASE_URL}creategroup`, payload);
            setShowGroupModal(false);
            setGroupName('');
            setGroupMembers([]);
            fetchUserDetails();
        } catch (err) {
            console.error('Create group failed:', err);
        }
    };

    const [importantUsers, setImportantUsers] = useState(() => {
        const saved = localStorage.getItem("important_chats");
        return saved ? JSON.parse(saved) : [];
    });
    const [showImportantOnly, setShowImportantOnly] = useState(false);

    const toggleImportant = (e, userId) => {
        e.stopPropagation();
        const updated = importantUsers.includes(userId)
            ? importantUsers.filter(id => id !== userId)
            : [...importantUsers, userId];
        setImportantUsers(updated);
        localStorage.setItem("important_chats", JSON.stringify(updated));
    };

    const userOptions = users?.map(u => ({ value: u.id, label: u.full_name }));

    // Function to get user name by ID
    const getUserNameById = (userId) => {
        const numericUserId = parseInt(userId);
        if (senderDetails[numericUserId]) return senderDetails[numericUserId].full_name;
        const user = users.find(u => u.id === numericUserId);
        if (user) return user.full_name;
        const chatUser = allChats.find(c => c.id === numericUserId && c.type === 'user');
        if (chatUser) return chatUser.full_name;
        return 'Unknown';
    };

    return (
        <div className="d-flex flex-column vh-100">
            {/* Mobile header */}
            <div className="d-flex d-md-none align-items-center p-2 bg-light border-bottom">
                <Button
                    variant="light"
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="me-2"
                >
                    {showSidebar ? '✕' : '☰'}
                </Button>
                <h5 className="mb-0 text-truncate">
                    {selectedChat ?
                        `Chat with ${selectedChat.type === 'group' ? selectedChat.group_name : selectedChat.full_name}` :
                        'Messaging'}
                </h5>
            </div>

            <div className="d-flex flex-grow-1 overflow-hidden">
                {/* Sidebar */}
                <div
                    className={`chat-sidebar border-end p-3 bg-light ${showSidebar ? 'd-block' : 'd-none'} d-md-block`}
                    style={{ width: '350px', minWidth: '350px' }}
                >
                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 mb-3">
                        <h5 className="fw-bold mb-0">Chats</h5>
                        <Button
                            variant="primary"
                            size="sm"
                            className="ms-sm-auto"
                            onClick={() => setShowGroupModal(true)}
                        >
                            + Group
                        </Button>
                    </div>

                    <div className="mb-3 d-flex gap-2 align-items-center">
                        <div className="input-group input-group-sm flex-grow-1">
                            <span className="input-group-text bg-white border-end-0">
                                <i className="fa-solid fa-magnifying-glass text-muted"></i>
                            </span>
                            <input
                                type="text"
                                className="form-control border-start-0 ps-0"
                                placeholder="Search chats..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ boxShadow: 'none' }}
                            />
                        </div>
                        <Button 
                            variant={showImportantOnly ? "warning" : "outline-secondary"} 
                            size="sm" 
                            onClick={() => setShowImportantOnly(!showImportantOnly)}
                            title="Show Important Only"
                        >
                            <i className={`fa-${showImportantOnly ? 'solid' : 'regular'} fa-star`}></i>
                        </Button>
                    </div>

                    <div className="chat-list-container" style={{ height: 'calc(100vh - 180px)', overflowY: 'auto' }}>
                        {allChats
                            .filter(chat => {
                                const name = (chat.full_name || chat.group_name || "").toLowerCase();
                                const matchesSearch = name.includes(searchTerm.toLowerCase());
                                const matchesImportant = showImportantOnly ? importantUsers.includes(chat.id) : true;
                                return matchesSearch && matchesImportant;
                            })
                            .filter(chat => {
                                if (currentUserRole === 'counselor') {
                                    return chat.type === 'group' || chat.role === 'student' || chat.role === 'admin' || chat.role === 'masteradmin' || chat.role === 'staff' || chat.student_id;
                                }
                                if (currentUserRole === 'student') {
                                    return chat.type === 'group' || chat.role === 'counselor' || chat.role === 'processor' || chat.role === 'processors' || chat.role === 'admin' || chat.role === 'masteradmin' || chat.role === 'staff' || chat.counselor_id;
                                }
                                return true;
                            })
                            .sort((a, b) => {
                                if ((a.unread_count || 0) > 0 && (b.unread_count || 0) === 0) return -1;
                                if ((a.unread_count || 0) === 0 && (b.unread_count || 0) > 0) return 1;
                                const timeA = a.last_message_time ? new Date(a.last_message_time).getTime() : 0;
                                const timeB = b.last_message_time ? new Date(b.last_message_time).getTime() : 0;
                                return timeB - timeA;
                            }).length === 0 ? (
                                <div className="text-center py-5 text-muted">
                                    <i className="fa-regular fa-comment-dots fs-1 mb-3 d-block"></i>
                                    {showImportantOnly ? "No important chats" : "No chats found"}
                                </div>
                            ) : allChats
                            .filter(chat => {
                                const name = (chat.full_name || chat.group_name || "").toLowerCase();
                                const matchesSearch = name.includes(searchTerm.toLowerCase());
                                const matchesImportant = showImportantOnly ? importantUsers.includes(chat.id) : true;
                                return matchesSearch && matchesImportant;
                            })
                            .filter(chat => {
                                if (currentUserRole === 'counselor') {
                                    return chat.type === 'group' || chat.role === 'student' || chat.role === 'admin' || chat.role === 'masteradmin' || chat.role === 'staff' || chat.student_id;
                                }
                                if (currentUserRole === 'student') {
                                    return chat.type === 'group' || chat.role === 'counselor' || chat.role === 'processor' || chat.role === 'processors' || chat.role === 'admin' || chat.role === 'masteradmin' || chat.role === 'staff' || chat.counselor_id;
                                }
                                return true;
                            })
                            .sort((a, b) => {
                                if ((a.unread_count || 0) > 0 && (b.unread_count || 0) === 0) return -1;
                                if ((a.unread_count || 0) === 0 && (b.unread_count || 0) > 0) return 1;
                                const timeA = a.last_message_time ? new Date(a.last_message_time).getTime() : 0;
                                const timeB = b.last_message_time ? new Date(b.last_message_time).getTime() : 0;
                                return timeB - timeA;
                            })
                            .map((chat) => (
                            <div
                                key={`${chat.type}-${chat.id}`}
                                className={`p-2 mb-2 rounded shadow-sm d-flex align-items-center justify-content-between ${selectedChat?.id === chat.id && selectedChat?.type === chat.type ? 'border border-primary bg-primary text-white' : 'bg-white'}`}
                                onClick={() => openChat(chat)}
                                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                                <div className="d-flex align-items-center flex-grow-1 overflow-hidden">
                                    <div className="me-2 fs-4" style={{ minWidth: '40px' }}>{chat.type === 'user' ? '👤' : '👥'}</div>
                                    <div className="overflow-hidden">
                                        <div className="fw-bold text-truncate" style={{ fontSize: '0.9rem' }}>
                                            {chat.type === 'user' && chat.id === currentUserId ? 'You' : `${chat.full_name || chat.group_name} ${chat.type === "user" ? `(${chat?.role})` : ""}`}
                                        </div>
                                        <div className={`small ${selectedChat?.id === chat.id ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>
                                            {chat.type}
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex flex-column align-items-end ms-2" style={{ minWidth: '60px' }}>
                                    <div className="d-flex align-items-center gap-1 mb-1">
                                        <i 
                                            className={`fa-${importantUsers.includes(chat.id) ? 'solid text-warning' : 'regular text-muted'} fa-star`}
                                            onClick={(e) => toggleImportant(e, chat.id)}
                                            style={{ cursor: 'pointer', fontSize: '0.8rem' }}
                                        ></i>
                                        {chat.unread_count > 0 && (
                                            <span className="badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                                                {chat.unread_count}
                                            </span>
                                        )}
                                    </div>
                                    {chat.last_message_time && (
                                        <div className={`small ${selectedChat?.id === chat.id ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.65rem' }}>
                                            {new Date(chat.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    )}
                                </div>

                                {currentUserId == 1 && chat?.group_name && (
                                    <Button variant="link" className="text-danger p-0 ms-2" onClick={(e) => {
                                        e.stopPropagation();
                                        deleteGroup(chat.id);
                                    }}>
                                        <i className="fa-solid fa-trash-can"></i>
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat area */}
                <div className="d-flex flex-column flex-grow-1 bg-white">
                    {selectedChat ? (
                        <>
                            <div className="d-flex px-4 py-3 border-bottom align-items-center justify-content-between">
                                <div className="d-flex align-items-center">
                                    <div className="fs-3 me-3">{selectedChat.type === 'user' ? '👤' : '👥'}</div>
                                    <div>
                                        <h5 className="mb-0 fw-bold">
                                            {selectedChat.type === 'group' ? selectedChat.group_name : selectedChat.full_name}
                                        </h5>
                                        <div className="small text-muted">{selectedChat.type} • Active Now</div>
                                    </div>
                                </div>
                                <div className="d-flex gap-3 text-muted">
                                    <i className="fa-solid fa-phone cursor-pointer"></i>
                                    <i className="fa-solid fa-video cursor-pointer"></i>
                                    <i className="fa-solid fa-circle-info cursor-pointer"></i>
                                </div>
                            </div>
                            <div className="flex-grow-1 overflow-auto p-4 bg-light" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' }}>
                                {(() => {
                                    let lastDate = null;

                                    return chatHistory.map((msg, idx) => {
                                        const messageDate = new Date(msg.created_at);
                                        const formattedDate = formatDateLabel(messageDate);

                                        const isNewDate = !lastDate || new Date(lastDate).toDateString() !== messageDate.toDateString();
                                        lastDate = messageDate;

                                        const isSender = String(msg.sender_id) === String(getCurrentRoleWiseId());

                                        let senderName = 'Unknown';
                                        if (msg.sender_full_name) {
                                            senderName = msg.sender_full_name;
                                        } else {
                                            senderName = getUserNameById(msg.sender_id);
                                        }

                                        return (
                                            <React.Fragment key={idx}>
                                                {isNewDate && (
                                                    <div className="text-center my-4">
                                                        <span className="badge bg-white text-muted shadow-sm px-3 py-2 rounded-pill border" style={{ fontSize: '0.75rem' }}>
                                                            {formattedDate}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className={`d-flex mb-3 ${isSender ? 'justify-content-end' : 'justify-content-start'}`}>
                                                    <div
                                                        className={`p-3 rounded-4 shadow-sm ${isSender ? 'bg-primary text-white' : 'bg-white text-dark'}`}
                                                        style={{
                                                            maxWidth: '70%',
                                                            minWidth: '100px',
                                                            borderRadius: isSender ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                                                            position: 'relative'
                                                        }}
                                                    >
                                                        {!isSender && selectedChat.type === 'group' && (
                                                            <div className="fw-bold small mb-1 text-primary">{senderName}</div>
                                                        )}
                                                        <div style={{ wordBreak: 'break-word', fontSize: '0.95rem' }}>{msg.message}</div>
                                                        <div className={`text-end mt-1 ${isSender ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.65rem' }}>
                                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            {isSender && <i className="fa-solid fa-check-double ms-1"></i>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </React.Fragment>
                                        );
                                    });
                                })()}
                                <div ref={messagesEndRef} />
                            </div>
                            <div className="p-3 bg-white border-top">
                                <div className="d-flex align-items-center gap-2 bg-light rounded-pill px-3 py-2 border">
                                    <i className="fa-solid fa-paperclip text-muted cursor-pointer fs-5"></i>
                                    <input
                                        className="form-control border-0 bg-transparent shadow-none"
                                        placeholder="Type a message..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        style={{ fontSize: '0.95rem' }}
                                    />
                                    <i className="fa-regular fa-face-smile text-muted cursor-pointer fs-5"></i>
                                    <div 
                                        className={`rounded-circle d-flex align-items-center justify-content-center ${!message.trim() ? 'bg-secondary' : 'bg-primary'} text-white shadow-sm`}
                                        style={{ width: '40px', height: '40px', cursor: 'pointer', minWidth: '40px' }}
                                        onClick={handleSendMessage}
                                    >
                                        <i className="fa-solid fa-paper-plane"></i>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="d-flex justify-content-center align-items-center h-100 bg-light">
                            <div className="text-center p-5 bg-white rounded-4 shadow-sm border" style={{ maxWidth: '400px' }}>
                                <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: '80px', height: '80px' }}>
                                    <i className="fa-regular fa-comments fs-1"></i>
                                </div>
                                <h3 className="fw-bold">Stay Connected</h3>
                                <p className="text-muted">Choose a contact from the left to start a conversation or view your message history.</p>
                                <Button variant="primary" className="rounded-pill px-4" onClick={() => setShowSidebar(true)}>
                                    Browse Contacts
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Modal show={showGroupModal} onHide={() => setShowGroupModal(false)} centered>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title className="fw-bold">Create New Group</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Group Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter a descriptive name"
                                value={groupName}
                                className="rounded-3"
                                onChange={(e) => setGroupName(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="fw-semibold">Select Members</Form.Label>
                            <Select
                                isMulti
                                options={userOptions}
                                value={groupMembers}
                                onChange={setGroupMembers}
                                className="rounded-3"
                                placeholder="Search and select people..."
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="bg-light border-0">
                    <Button variant="light" onClick={() => setShowGroupModal(false)} className="rounded-pill px-4">Cancel</Button>
                    <Button variant="primary" onClick={handleCreateGroup} className="rounded-pill px-4">Create Group</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ChatAppLayout;