import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { mockRequests, STATUS_STEPS } from '../data/mockRequests';
import { mockNotifications } from '../data/mockNotifications';

const RequestContext = createContext(null);

const STORAGE_REQUESTS = 'resqconnect_citizen_requests_v2';
const STORAGE_NOTIFICATIONS = 'resqconnect_citizen_notifications_v2';
const STORAGE_DRAFT = 'resqconnect_citizen_request_draft';

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

  // Sync Requests to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_REQUESTS, JSON.stringify(requests));
    } catch (e) {
      console.error('Error persisting requests to localStorage', e);
    }
  }, [requests]);

  // Sync Notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) {
      console.error('Error persisting notifications to localStorage', e);
    }
  }, [notifications]);

  // Sync Draft to localStorage
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

  // Add a new request
  const addRequest = (formData, user) => {
    const newId = generateNextId();
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateFormatted = now.toLocaleDateString([], { month: 'short', day: 'numeric' });
    const timestampStr = `${dateFormatted}, ${timeFormatted}`;

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

    // Add to requests list (newest first)
    setRequests(prev => [newRequest, ...prev]);

    // Create a new notification
    const newNotification = {
      id: `notif-${Date.now()}`,
      requestId: newId,
      type: 'submitted',
      title: 'Request Submitted',
      desc: `Your request ${newId} has been submitted successfully and is awaiting verification.`,
      time: 'Just now',
      timestamp: now.toISOString(),
      unread: true
    };
    setNotifications(prev => [newNotification, ...prev]);

    // Clear draft if it was saved
    setDraft(null);

    return newRequest;
  };

  // Update request status (with timeline and notification)
  const updateRequestStatus = (id, newStatus, customNote = null) => {
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateFormatted = now.toLocaleDateString([], { month: 'short', day: 'numeric' });
    const timestampStr = `${dateFormatted}, ${timeFormatted}`;

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
      default:
        notifTitle = 'Status Update';
        notifDesc = `Your request ${id} has updated to ${newStatus}.`;
        notifType = 'status';
    }

    setRequests(prev =>
      prev.map(req => {
        if (req.id !== id) return req;

        // Form timeline note
        const defaultNotes = {
          'Submitted': 'Request lodged via Citizen Portal.',
          'Under Verification': 'Local field coordinator assigned for rapid telephone & neighborhood validation.',
          'Verified': 'Need and household location authenticated. Queued for NGO inventory allocation.',
          'Matched': 'Assigned to Helping Hands Foundation relief team. Volunteer Priya Mehta dispatched.',
          'Assistance In Progress': 'Field team actively coordinating dispatch and delivery to location.',
          'Completed': 'Relief supplies handed over with citizen acknowledgment signature.',
          'Closed': 'Ticket successfully archived and recovery milestone achieved.'
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

    // Also push notification
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

  // Reset to default mock data (useful button for reviewers/demos)
  const resetToDefaultMockData = () => {
    setRequests(mockRequests);
    setNotifications(mockNotifications);
    setDraft(null);
    localStorage.removeItem(STORAGE_REQUESTS);
    localStorage.removeItem(STORAGE_NOTIFICATIONS);
    localStorage.removeItem(STORAGE_DRAFT);
  };

  // Calculate dynamic statistics
  const stats = useMemo(() => {
    const active = requests.filter(r => !['Completed', 'Closed'].includes(r.status)).length;
    const underVerification = requests.filter(r => r.status === 'Under Verification').length;
    const inProgress = requests.filter(r => r.status === 'Assistance In Progress').length;
    const completed = requests.filter(r => r.status === 'Completed').length;
    const total = requests.length;

    return {
      active,
      underVerification,
      inProgress,
      completed,
      total
    };
  }, [requests]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(n => n.unread).length;
  }, [notifications]);

  return (
    <RequestContext.Provider
      value={{
        requests,
        notifications,
        draft,
        stats,
        unreadNotificationsCount,
        addRequest,
        updateRequest,
        updateRequestStatus,
        advanceRequestStatus,
        getRequestById,
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
