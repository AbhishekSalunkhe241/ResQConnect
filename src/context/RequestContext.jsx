import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { mockRequests, STATUS_STEPS } from '../data/mockRequests';
import { mockNotifications } from '../data/mockNotifications';
import { mockResources } from '../data/mockResources';
import { mockUsers } from '../data/mockUsers';
import { mockAuditLogs } from '../data/mockAuditLogs';
import { mockRecoveryHubs } from '../data/mockHubs';

const RequestContext = createContext(null);

const STORAGE_REQUESTS = 'resqconnect_citizen_requests_v2';
const STORAGE_NOTIFICATIONS = 'resqconnect_citizen_notifications_v2';
const STORAGE_DRAFT = 'resqconnect_citizen_request_draft';
const STORAGE_RESOURCES = 'resqconnect_resources_v2';
const STORAGE_USERS = 'resqconnect_users_v2';
const STORAGE_AUDIT = 'resqconnect_audit_logs_v2';
const STORAGE_HUBS = 'resqconnect_hubs_v2';

export const RequestProvider = ({ children }) => {
  // Initialize Requests
  const [requests, setRequests] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_REQUESTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading requests from localStorage', e);
    }
    return mockRequests;
  });

  // Initialize Notifications
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_NOTIFICATIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading notifications from localStorage', e);
    }
    return mockNotifications;
  });

  // Initialize Draft
  const [draft, setDraft] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_DRAFT);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error reading draft from localStorage', e);
    }
    return null;
  });

  // Initialize Resources
  const [resources, setResources] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_RESOURCES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading resources from localStorage', e);
    }
    return mockResources;
  });

  // Initialize Users List
  const [usersList, setUsersList] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading users from localStorage', e);
    }
    return mockUsers;
  });

  // Initialize Audit Logs
  const [auditLogs, setAuditLogs] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_AUDIT);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading audit logs from localStorage', e);
    }
    return mockAuditLogs;
  });

  // Initialize Recovery Hubs
  const [recoveryHubs, setRecoveryHubs] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_HUBS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading hubs from localStorage', e);
    }
    return mockRecoveryHubs;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_REQUESTS, JSON.stringify(requests));
    } catch (e) {
      console.error('Error persisting requests to localStorage', e);
    }
  }, [requests]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) {
      console.error('Error persisting notifications to localStorage', e);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      if (draft) {
        localStorage.setItem(STORAGE_DRAFT, JSON.stringify(draft));
      } else {
        localStorage.removeItem(STORAGE_DRAFT);
      }
    } catch (e) {
      console.error('Error persisting draft to localStorage', e);
    }
  }, [draft]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_RESOURCES, JSON.stringify(resources));
    } catch (e) {
      console.error('Error persisting resources to localStorage', e);
    }
  }, [resources]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_USERS, JSON.stringify(usersList));
    } catch (e) {
      console.error('Error persisting users to localStorage', e);
    }
  }, [usersList]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_AUDIT, JSON.stringify(auditLogs));
    } catch (e) {
      console.error('Error persisting audit logs to localStorage', e);
    }
  }, [auditLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_HUBS, JSON.stringify(recoveryHubs));
    } catch (e) {
      console.error('Error persisting recovery hubs to localStorage', e);
    }
  }, [recoveryHubs]);

  // Helper for formatted timestamps
  const getFormattedNow = () => {
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateFormatted = now.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return `${dateFormatted}, ${timeFormatted}`;
  };

  // Helper to append audit entry
  const addAuditLog = (actionType, targetId, targetType, details, actorName = 'System Desk', actorRole = 'admin') => {
    const entry = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: getFormattedNow(),
      actionType,
      actor: actorName,
      actorRole,
      targetId,
      targetType,
      details
    };
    setAuditLogs(prev => [entry, ...prev]);
    return entry;
  };

  // Helper to generate next Request ID like RQ-1026
  const generateNextId = () => {
    const existingNumbers = requests
      .map(r => {
        const match = r.id.match(/RQ-(\d+)/);
        return match ? parseInt(match[1], 10) : 1000;
      })
      .filter(n => !isNaN(n));

    const highest = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 1025;
    return `RQ-${highest + 1}`;
  };

  // Add a new request (Citizen)
  const addRequest = (formData, user) => {
    const newId = generateNextId();
    const now = new Date();
    const timestampStr = getFormattedNow();

    const fullLocation = formData.addressDetails
      ? `${formData.addressDetails.address}, ${formData.addressDetails.city}, ${formData.addressDetails.state} - ${formData.addressDetails.postalCode}`
      : (formData.location || 'Panvel, Maharashtra');

    const newRequest = {
      id: newId,
      category: formData.category || 'Food & Water',
      priority: formData.priority || 'Medium',
      status: 'Submitted',
      title: formData.title || `${formData.category} assistance request`,
      description: formData.description || '',
      location: fullLocation,
      addressDetails: formData.addressDetails || {
        address: formData.location || 'Local area',
        city: 'Panvel',
        state: 'Maharashtra',
        postalCode: '410206'
      },
      peopleAffected: Number(formData.peopleAffected) || 1,
      accessibility: formData.accessibility || 'None',
      additionalNotes: formData.additionalNotes || '',
      createdAt: now.toISOString(),
      requester: {
        name: user?.name || 'Rahul Sharma',
        phone: user?.phone || '+91 98201 44521',
        type: 'Citizen',
        affectedCount: Number(formData.peopleAffected) || 1
      },
      assignedOrganization: null,
      assignedVolunteer: null,
      estimatedAssistance: null,
      itemsNeeded: formData.itemsNeeded && formData.itemsNeeded.length > 0
        ? formData.itemsNeeded
        : [{ item: `${formData.category} assistance kit`, qty: 1, unit: 'units' }],
      timeline: [
        {
          step: 'Submitted',
          timestamp: timestampStr,
          note: 'Request lodged via Citizen Portal and queued for intake verification.'
        }
      ]
    };

    setRequests(prev => [newRequest, ...prev]);

    // Push notification
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        requestId: newId,
        type: 'submitted',
        title: 'Request Submitted',
        desc: `Your request ${newId} has been submitted successfully and is awaiting verification.`,
        time: 'Just now',
        timestamp: now.toISOString(),
        unread: true
      },
      ...prev
    ]);

    addAuditLog('REQUEST_SUBMITTED', newId, 'Assistance Request', `New assistance request ${newId} created for ${formData.category}`, user?.name || 'Citizen', 'citizen');

    setDraft(null);
    return newRequest;
  };

  // Update request status (with timeline and notification)
  const updateRequestStatus = (id, newStatus, customNote = null, actor = 'System Desk') => {
    const timestampStr = getFormattedNow();
    const now = new Date();

    let notifTitle = '';
    let notifDesc = '';
    let notifType = 'status';

    switch (newStatus) {
      case 'Under Verification':
        notifTitle = 'Verification Update';
        notifDesc = `Your request ${id} is currently under verification.`;
        notifType = 'verification';
        break;
      case 'Verified':
        notifTitle = 'Request Verified';
        notifDesc = `Your request ${id} has been verified and is ready for relief partner matching.`;
        notifType = 'verification';
        break;
      case 'Matched':
        notifTitle = 'Request Matched';
        notifDesc = `Your request ${id} has been matched with Helping Hands Foundation. Assigned volunteer: Priya Mehta.`;
        notifType = 'match';
        break;
      case 'Assistance In Progress':
        notifTitle = 'Assistance Update';
        notifDesc = `A volunteer has started working on your request ${id}. Supplies in transit.`;
        notifType = 'progress';
        break;
      case 'Completed':
        notifTitle = 'Assistance Completed';
        notifDesc = `The requested assistance for ${id} has been successfully completed.`;
        notifType = 'completed';
        break;
      case 'Closed':
        notifTitle = 'Request Closed';
        notifDesc = `Your request ${id} has been closed.`;
        notifType = 'closed';
        break;
      case 'Rejected':
        notifTitle = 'Request Not Approved';
        notifDesc = `Your request ${id} could not be approved at this time: ${customNote || 'Please contact local recovery coordinator.'}`;
        notifType = 'closed';
        break;
      default:
        notifTitle = 'Status Update';
        notifDesc = `Your request ${id} has updated to ${newStatus}.`;
        notifType = 'status';
    }

    setRequests(prev =>
      prev.map(req => {
        if (req.id !== id) return req;

        const defaultNotes = {
          'Submitted': 'Request lodged via Citizen Portal.',
          'Under Verification': 'Local field coordinator assigned for rapid telephone & neighborhood validation.',
          'Verified': 'Need and household location authenticated. Queued for NGO inventory allocation.',
          'Matched': 'Assigned to Helping Hands Foundation relief team. Volunteer Priya Mehta dispatched.',
          'Assistance In Progress': 'Field team actively coordinating dispatch and delivery to location.',
          'Completed': 'Relief supplies handed over with citizen acknowledgment signature.',
          'Closed': 'Ticket successfully archived and recovery milestone achieved.',
          'Rejected': customNote || 'Request could not be validated by administrative desk.'
        };

        const note = customNote || defaultNotes[newStatus] || `Status updated to ${newStatus}.`;

        const newTimeline = [...(req.timeline || [])];
        const existingStepIndex = newTimeline.findIndex(t => t.step === newStatus);

        if (existingStepIndex >= 0) {
          newTimeline[existingStepIndex] = {
            step: newStatus,
            timestamp: timestampStr,
            note
          };
        } else {
          newTimeline.push({
            step: newStatus,
            timestamp: timestampStr,
            note
          });
        }

        const isMatchedOrLater = ['Matched', 'Assistance In Progress', 'Completed', 'Closed'].includes(newStatus);

        return {
          ...req,
          status: newStatus,
          timeline: newTimeline,
          assignedOrganization: isMatchedOrLater && !req.assignedOrganization
            ? {
                id: 'org-1',
                name: 'Helping Hands Foundation',
                contactPerson: 'Karan Deshmukh',
                phone: '+91 22 2745 8890',
                badge: 'Tier 1 Verified NGO'
              }
            : req.assignedOrganization,
          assignedVolunteer: isMatchedOrLater && !req.assignedVolunteer
            ? {
                id: 'vol-1',
                name: 'Priya Mehta',
                phone: '+91 98192 33412',
                badge: 'Certified Responder'
              }
            : req.assignedVolunteer,
          estimatedAssistance: isMatchedOrLater
            ? (newStatus === 'Completed' || newStatus === 'Closed' ? 'Delivered' : 'Within 24 hours')
            : req.estimatedAssistance
        };
      })
    );

    if (notifTitle) {
      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          requestId: id,
          type: notifType,
          title: notifTitle,
          desc: notifDesc,
          time: 'Just now',
          timestamp: now.toISOString(),
          unread: true
        },
        ...prev
      ]);
    }

    addAuditLog('STATUS_CHANGE', id, 'Assistance Request', `Status updated to "${newStatus}". Note: ${customNote || 'Standard progression'}`, actor, 'admin');
  };

  // Simulate next status cycle for Demo Mode
  const advanceRequestStatus = (id) => {
    const target = requests.find(r => r.id === id);
    if (!target) return null;

    const currentIndex = STATUS_STEPS.indexOf(target.status);
    const nextIndex = (currentIndex + 1) % STATUS_STEPS.length;
    const nextStatus = STATUS_STEPS[nextIndex];

    updateRequestStatus(id, nextStatus);
    return nextStatus;
  };

  // General request updater
  const updateRequest = (id, fields) => {
    setRequests(prev =>
      prev.map(req => (req.id === id ? { ...req, ...fields } : req))
    );
  };

  // Fetch request by ID
  const getRequestById = (id) => {
    return requests.find(r => r.id === id) || null;
  };

  // ==========================================
  // Volunteer Actions
  // ==========================================
  const acceptVolunteerTask = (requestId, volunteerUser) => {
    const timestampStr = getFormattedNow();
    const volunteerName = volunteerUser?.name || 'Priya Mehta';
    const volunteerPhone = volunteerUser?.phone || '+91 98192 33412';
    const volunteerBadge = volunteerUser?.badge || 'Certified Responder';

    setRequests(prev =>
      prev.map(req => {
        if (req.id !== requestId) return req;

        const updatedTimeline = [
          ...(req.timeline || []),
          {
            step: 'Assistance In Progress',
            timestamp: timestampStr,
            note: `Volunteer ${volunteerName} accepted task and mobilized dispatch.`
          }
        ];

        return {
          ...req,
          status: 'Assistance In Progress',
          assignedVolunteer: {
            id: volunteerUser?.id || 'user-v1',
            name: volunteerName,
            phone: volunteerPhone,
            badge: volunteerBadge
          },
          timeline: updatedTimeline
        };
      })
    );

    // Update volunteer stats in usersList
    if (volunteerUser?.id) {
      setUsersList(prev =>
        prev.map(u => (u.id === volunteerUser.id ? { ...u, status: 'On Field Mission', assignedTasksCount: (u.assignedTasksCount || 0) + 1 } : u))
      );
    }

    // Citizen notification
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        requestId,
        type: 'progress',
        title: 'Volunteer Dispatched',
        desc: `${volunteerName} has accepted your request ${requestId} and is preparing relief transit.`,
        time: 'Just now',
        timestamp: new Date().toISOString(),
        unread: true
      },
      ...prev
    ]);

    addAuditLog('VOLUNTEER_ACCEPT', requestId, 'Task Assignment', `Volunteer ${volunteerName} accepted task ${requestId}`, volunteerName, 'volunteer');
  };

  const addVolunteerCheckIn = (requestId, note, volunteerName = 'Volunteer') => {
    const timestampStr = getFormattedNow();

    setRequests(prev =>
      prev.map(req => {
        if (req.id !== requestId) return req;

        const checkInNotes = req.checkInNotes ? [...req.checkInNotes] : [];
        checkInNotes.push({
          timestamp: timestampStr,
          note,
          author: volunteerName
        });

        const updatedTimeline = [
          ...(req.timeline || []),
          {
            step: 'Field Check-in',
            timestamp: timestampStr,
            note: `Progress update by ${volunteerName}: ${note}`
          }
        ];

        return {
          ...req,
          checkInNotes,
          timeline: updatedTimeline
        };
      })
    );

    // Notification
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        requestId,
        type: 'progress',
        title: 'Field Check-In Update',
        desc: `Update on ${requestId}: ${note}`,
        time: 'Just now',
        timestamp: new Date().toISOString(),
        unread: true
      },
      ...prev
    ]);

    addAuditLog('VOLUNTEER_CHECKIN', requestId, 'Progress Update', `${volunteerName} added progress check-in: "${note}"`, volunteerName, 'volunteer');
  };

  const completeVolunteerTask = (requestId, completionNote, proofDescription, volunteerUser) => {
    const timestampStr = getFormattedNow();
    const volunteerName = volunteerUser?.name || 'Volunteer';

    setRequests(prev =>
      prev.map(req => {
        if (req.id !== requestId) return req;

        const updatedTimeline = [
          ...(req.timeline || []),
          {
            step: 'Completed',
            timestamp: timestampStr,
            note: `Relief delivered & signed off by ${volunteerName}. Proof/Notes: ${completionNote || 'Delivery verified in person.'}`
          }
        ];

        return {
          ...req,
          status: 'Completed',
          completionNote: completionNote || 'Assistance successfully handed over.',
          proofDescription: proofDescription || 'In-person verification confirmed.',
          completedAt: timestampStr,
          timeline: updatedTimeline
        };
      })
    );

    // Update volunteer in usersList
    if (volunteerUser?.id) {
      setUsersList(prev =>
        prev.map(u => (u.id === volunteerUser.id ? {
          ...u,
          status: 'Available',
          assignedTasksCount: Math.max(0, (u.assignedTasksCount || 1) - 1),
          completedTasksCount: (u.completedTasksCount || 0) + 1
        } : u))
      );
    }

    // Citizen notification
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        requestId,
        type: 'completed',
        title: 'Assistance Delivered & Completed',
        desc: `Relief mission for ${requestId} has been marked Completed by ${volunteerName}. Thank you for using ResQConnect!`,
        time: 'Just now',
        timestamp: new Date().toISOString(),
        unread: true
      },
      ...prev
    ]);

    addAuditLog('TASK_COMPLETED', requestId, 'Assistance Request', `Task completed by ${volunteerName}. Note: ${completionNote}`, volunteerName, 'volunteer');
  };

  // ==========================================
  // NGO Operations Actions
  // ==========================================
  const assignVolunteerToRequest = (requestId, volunteerId, volunteerName, ngoName = 'Helping Hands Foundation') => {
    const timestampStr = getFormattedNow();
    const vol = usersList.find(u => u.id === volunteerId);

    setRequests(prev =>
      prev.map(req => {
        if (req.id !== requestId) return req;

        const updatedTimeline = [
          ...(req.timeline || []),
          {
            step: 'Matched',
            timestamp: timestampStr,
            note: `${ngoName} assigned field volunteer ${volunteerName || vol?.name} for direct delivery.`
          }
        ];

        return {
          ...req,
          status: req.status === 'Submitted' || req.status === 'Under Verification' || req.status === 'Verified' ? 'Matched' : req.status,
          assignedVolunteer: {
            id: volunteerId,
            name: volunteerName || vol?.name || 'Assigned Volunteer',
            phone: vol?.phone || '+91 98192 33412',
            badge: vol?.badge || 'Field Responder'
          },
          timeline: updatedTimeline
        };
      })
    );

    // Update volunteer status
    setUsersList(prev =>
      prev.map(u => (u.id === volunteerId ? { ...u, status: 'On Field Mission', assignedTasksCount: (u.assignedTasksCount || 0) + 1 } : u))
    );

    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        requestId,
        type: 'match',
        title: 'Volunteer Assigned',
        desc: `Field volunteer ${volunteerName || vol?.name} has been assigned to request ${requestId}.`,
        time: 'Just now',
        timestamp: new Date().toISOString(),
        unread: true
      },
      ...prev
    ]);

    addAuditLog('VOLUNTEER_ASSIGN', requestId, 'Assistance Request', `Assigned ${volunteerName || vol?.name} to request ${requestId}`, ngoName, 'ngo');
  };

  const rejectRequest = (requestId, reason, actorName = 'Field Review Desk', actorRole = 'ngo') => {
    updateRequestStatus(requestId, 'Rejected', reason, actorName);
  };

  // ==========================================
  // Resource Inventory Management
  // ==========================================
  const addResource = (newResourceData, ngoName = 'Helping Hands Foundation') => {
    const newId = `res-${Date.now()}`;
    const qty = Number(newResourceData.quantity) || 0;
    const threshold = Number(newResourceData.minThreshold) || 20;

    let stockStatus = 'In Stock';
    if (qty <= 0) stockStatus = 'Critical';
    else if (qty <= threshold) stockStatus = 'Low Stock';

    const item = {
      id: newId,
      name: newResourceData.name,
      category: newResourceData.category || 'Food & Water',
      quantity: qty,
      unit: newResourceData.unit || 'units',
      minThreshold: threshold,
      location: newResourceData.location || 'Panvel Central Depot',
      organization: newResourceData.organization || ngoName,
      status: stockStatus,
      lastUpdated: getFormattedNow(),
      notes: newResourceData.notes || 'Added to regional warehouse stock.'
    };

    setResources(prev => [item, ...prev]);
    addAuditLog('INVENTORY_ADD', newId, 'Relief Inventory', `Added ${qty} ${item.unit} of "${item.name}" at ${item.location}`, ngoName, 'ngo');
    return item;
  };

  const updateResourceQuantity = (resourceId, newQuantity, actorName = 'Warehouse Lead') => {
    const qty = Math.max(0, Number(newQuantity) || 0);

    setResources(prev =>
      prev.map(res => {
        if (res.id !== resourceId) return res;

        let status = 'In Stock';
        if (qty === 0) status = 'Critical';
        else if (qty <= res.minThreshold) status = 'Low Stock';

        return {
          ...res,
          quantity: qty,
          status,
          lastUpdated: getFormattedNow()
        };
      })
    );

    addAuditLog('INVENTORY_UPDATE', resourceId, 'Relief Inventory', `Updated inventory count to ${qty}`, actorName, 'ngo');
  };

  const markResourceUnavailable = (resourceId, actorName = 'Warehouse Lead') => {
    setResources(prev =>
      prev.map(res => (res.id === resourceId ? { ...res, status: 'Critical', quantity: 0, lastUpdated: getFormattedNow() } : res))
    );
    addAuditLog('INVENTORY_ZEROED', resourceId, 'Relief Inventory', `Marked resource as unavailable / zero balance`, actorName, 'ngo');
  };

  const allocateResource = (requestId, resourceId, quantityToAllocate, actorName = 'Helping Hands Foundation') => {
    const targetResource = resources.find(r => r.id === resourceId);
    if (!targetResource) return { success: false, error: 'Resource not found' };

    const qty = Number(quantityToAllocate) || 1;
    if (targetResource.quantity < qty) {
      return { success: false, error: `Insufficient inventory: only ${targetResource.quantity} available` };
    }

    // Deduct from inventory
    const remainingQty = targetResource.quantity - qty;
    let status = 'In Stock';
    if (remainingQty === 0) status = 'Critical';
    else if (remainingQty <= targetResource.minThreshold) status = 'Low Stock';

    setResources(prev =>
      prev.map(r => (r.id === resourceId ? { ...r, quantity: remainingQty, status, lastUpdated: getFormattedNow() } : r))
    );

    // Record allocation onto request
    const timestampStr = getFormattedNow();
    setRequests(prev =>
      prev.map(req => {
        if (req.id !== requestId) return req;

        const allocations = req.allocatedResources ? [...req.allocatedResources] : [];
        allocations.push({
          resourceId,
          resourceName: targetResource.name,
          category: targetResource.category,
          quantity: qty,
          unit: targetResource.unit,
          location: targetResource.location,
          timestamp: timestampStr
        });

        const updatedTimeline = [
          ...(req.timeline || []),
          {
            step: 'Resource Allocated',
            timestamp: timestampStr,
            note: `Allocated ${qty} ${targetResource.unit} of ${targetResource.name} from ${targetResource.location}.`
          }
        ];

        return {
          ...req,
          allocatedResources: allocations,
          timeline: updatedTimeline
        };
      })
    );

    // Citizen notification
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        requestId,
        type: 'progress',
        title: 'Relief Resources Allocated',
        desc: `${qty} ${targetResource.unit} of ${targetResource.name} allocated from warehouse depot for your request.`,
        time: 'Just now',
        timestamp: new Date().toISOString(),
        unread: true
      },
      ...prev
    ]);

    addAuditLog('RESOURCE_ALLOCATION', requestId, 'Relief Inventory', `Allocated ${qty} ${targetResource.unit} of ${targetResource.name} to ${requestId}`, actorName, 'ngo');
    return { success: true, remaining: remainingQty };
  };

  // ==========================================
  // Admin Verification & Moderation Actions
  // ==========================================
  const verifyUser = (userId, notes = '', adminName = 'System Administrator') => {
    setUsersList(prev =>
      prev.map(u => (u.id === userId ? { ...u, verified: true, pendingVerification: false, verificationNotes: notes } : u))
    );
    addAuditLog('VERIFICATION_APPROVAL', userId, 'User Account', `Approved verification credentials for user ${userId}. Note: ${notes || 'Verified'}`, adminName, 'admin');
  };

  const rejectUser = (userId, reason, adminName = 'System Administrator') => {
    setUsersList(prev =>
      prev.map(u => (u.id === userId ? { ...u, verified: false, pendingVerification: false, rejectionReason: reason } : u))
    );
    addAuditLog('VERIFICATION_REJECTED', userId, 'User Account', `Rejected verification for ${userId}. Reason: ${reason}`, adminName, 'admin');
  };

  const flagRequest = (requestId, reason, adminName = 'System Administrator') => {
    setRequests(prev =>
      prev.map(r => (r.id === requestId ? { ...r, isFlagged: true, flagReason: reason, flaggedAt: getFormattedNow() } : r))
    );
    addAuditLog('FLAG_REQUEST', requestId, 'Assistance Request', `Flagged as suspicious/duplicate. Reason: ${reason}`, adminName, 'admin');
  };

  const unflagRequest = (requestId, adminName = 'System Administrator') => {
    setRequests(prev =>
      prev.map(r => (r.id === requestId ? { ...r, isFlagged: false, flagReason: null } : r))
    );
    addAuditLog('UNFLAG_REQUEST', requestId, 'Assistance Request', `Flag removed after review`, adminName, 'admin');
  };

  // Notification helpers
  const markNotificationRead = (notifId) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notifId ? { ...n, unread: false } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const deleteNotification = (notifId) => {
    setNotifications(prev => prev.filter(n => n.id !== notifId));
  };

  // Draft helpers
  const saveDraft = (data) => {
    setDraft(data);
  };

  const clearDraft = () => {
    setDraft(null);
  };

  // Reset to default mock data (Full wipe & reseed for demo testing)
  const resetToDefaultMockData = () => {
    setRequests(mockRequests);
    setNotifications(mockNotifications);
    setResources(mockResources);
    setUsersList(mockUsers);
    setAuditLogs(mockAuditLogs);
    setRecoveryHubs(mockRecoveryHubs);
    setDraft(null);

    localStorage.removeItem(STORAGE_REQUESTS);
    localStorage.removeItem(STORAGE_NOTIFICATIONS);
    localStorage.removeItem(STORAGE_DRAFT);
    localStorage.removeItem(STORAGE_RESOURCES);
    localStorage.removeItem(STORAGE_USERS);
    localStorage.removeItem(STORAGE_AUDIT);
    localStorage.removeItem(STORAGE_HUBS);
  };

  // Dynamic Statistics
  const stats = useMemo(() => {
    const active = requests.filter(r => !['Completed', 'Closed', 'Rejected'].includes(r.status)).length;
    const underVerification = requests.filter(r => r.status === 'Under Verification').length;
    const verified = requests.filter(r => r.status === 'Verified').length;
    const matched = requests.filter(r => r.status === 'Matched').length;
    const inProgress = requests.filter(r => r.status === 'Assistance In Progress').length;
    const completed = requests.filter(r => r.status === 'Completed').length;
    const rejected = requests.filter(r => r.status === 'Rejected').length;
    const total = requests.length;
    const flaggedCount = requests.filter(r => r.isFlagged).length;

    const volunteers = usersList.filter(u => u.role === 'volunteer');
    const availableVolunteers = volunteers.filter(v => v.status === 'Available').length;
    const deployedVolunteers = volunteers.filter(v => v.status === 'Assigned' || v.status === 'On Field Mission').length;

    const ngos = usersList.filter(u => u.role === 'ngo');
    const pendingVerifications = usersList.filter(u => u.pendingVerification).length + requests.filter(r => r.status === 'Submitted' || r.status === 'Under Verification').length;

    const totalResourceUnits = resources.reduce((acc, r) => acc + (r.quantity || 0), 0);
    const lowStockResources = resources.filter(r => r.status === 'Low Stock' || r.status === 'Critical').length;

    return {
      active,
      underVerification,
      verified,
      matched,
      inProgress,
      completed,
      rejected,
      total,
      flaggedCount,
      totalVolunteers: volunteers.length,
      availableVolunteers,
      deployedVolunteers,
      totalNGOs: ngos.length,
      pendingVerifications,
      totalResourceUnits,
      lowStockResources
    };
  }, [requests, resources, usersList]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(n => n.unread).length;
  }, [notifications]);

  return (
    <RequestContext.Provider
      value={{
        requests,
        notifications,
        draft,
        resources,
        usersList,
        auditLogs,
        recoveryHubs,
        stats,
        unreadNotificationsCount,
        addRequest,
        updateRequest,
        updateRequestStatus,
        advanceRequestStatus,
        getRequestById,
        // Volunteer methods
        acceptVolunteerTask,
        addVolunteerCheckIn,
        completeVolunteerTask,
        // NGO methods
        assignVolunteerToRequest,
        rejectRequest,
        // Inventory methods
        addResource,
        updateResourceQuantity,
        markResourceUnavailable,
        allocateResource,
        // Admin methods
        verifyUser,
        rejectUser,
        flagRequest,
        unflagRequest,
        addAuditLog,
        // Notification & Draft
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        saveDraft,
        clearDraft,
        resetToDefaultMockData
      }}
    >
      {children}
    </RequestContext.Provider>
  );
};

export const useRequests = () => {
  const context = useContext(RequestContext);
  if (!context) {
    throw new Error('useRequests must be used within a RequestProvider');
  }
  return context;
};

export default RequestContext;
