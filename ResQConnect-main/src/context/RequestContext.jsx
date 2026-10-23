import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { 
  requestsApi, 
  resourcesApi, 
  hubsApi, 
  notificationsApi, 
  adminApi 
} from '../services/api';

import { STATUS_STEPS } from '../data/mockRequests';

const RequestContext = createContext(null);
const STORAGE_DRAFT = 'resqconnect_citizen_request_draft';

export const RequestProvider = ({ children }) => {
  const { currentUser } = useAuth();

  // Core Business State (Authoritative backend data)
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [resources, setResources] = useState([]);
  const [recoveryHubs, setRecoveryHubs] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  
  // Loading and Error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Client-side Citizen form draft (saved in local storage only for draft work-in-progress)
  const [draft, setDraft] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_DRAFT);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error reading draft from localStorage', e);
    }
    return null;
  });

  // Draft persistence
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

  // Synchronize live data from backend APIs
  const fetchData = useCallback(async () => {
    setError(null);
    try {
      setLoading(true);

      // 1. Fetch public/semi-public data (hubs and resources)
      const [hubsRes, resourcesRes] = await Promise.allSettled([
        hubsApi.getHubs(),
        resourcesApi.getResources()
      ]);

      if (hubsRes.status === 'fulfilled' && hubsRes.value?.data) {
        setRecoveryHubs(hubsRes.value.data);
      }
      if (resourcesRes.status === 'fulfilled' && resourcesRes.value?.data) {
        setResources(resourcesRes.value.data);
      }

      // 2. Fetch authenticated datasets if logged in
      if (currentUser) {
        // Fetch requests scoped to current user's role
        try {
          const reqsRes = await requestsApi.getRequests();
          if (reqsRes?.data) {
            setRequests(reqsRes.data);
          }
        } catch (err) {
          console.warn('Failed to load live requests from server:', err.message);
        }

        // Fetch notifications for current user
        try {
          const notifsRes = await notificationsApi.getNotifications();
          if (notifsRes?.data) {
            setNotifications(notifsRes.data);
          }
        } catch (err) {
          console.warn('Failed to load notifications:', err.message);
        }

        // If NGO or Admin, fetch registered users / volunteers
        if (currentUser.role === 'admin' || currentUser.role === 'ngo') {
          try {
            const usersRes = await adminApi.getUsers();
            if (usersRes?.data) {
              setUsersList(usersRes.data);
            }
          } catch (err) {
            console.warn('Failed to fetch user directory:', err.message);
          }
        }

        // If Admin, fetch live audit logs
        if (currentUser.role === 'admin') {
          try {
            const auditRes = await adminApi.getAuditLogs();
            if (auditRes?.data) {
              setAuditLogs(auditRes.data);
            }
          } catch (err) {
            console.warn('Failed to fetch live audit logs:', err.message);
          }
        }
      } else {
        // Unauthenticated view: clear user-scoped state cleanly without calling protected routes
        setRequests([]);
        setNotifications([]);
        setAuditLogs([]);
        setUsersList([]);
      }
    } catch (err) {
      console.error('Error synchronizing data with backend:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Synchronize on mount and whenever authentication state / role changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Timestamp helper
  const getFormattedNow = () => {
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateFormatted = now.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return `${dateFormatted}, ${timeFormatted}`;
  };

  // Add assistance request (Citizen)
  const addRequest = async (formData, user) => {
    try {
      const payload = {
        category: formData.category || 'Food & Water',
        priority: formData.priority || 'Medium',
        title: formData.title || `${formData.category} assistance request`,
        description: formData.description || '',
        location: formData.location,
        addressDetails: formData.addressDetails,
        peopleAffected: Number(formData.peopleAffected) || 1,
        accessibility: formData.accessibility || 'None',
        additionalNotes: formData.additionalNotes || '',
        itemsNeeded: formData.itemsNeeded && formData.itemsNeeded.length > 0
          ? formData.itemsNeeded
          : [{ item: `${formData.category} assistance kit`, qty: 1, unit: 'units' }]
      };

      const res = await requestsApi.createRequest(payload);
      if (res && res.data) {
        const created = res.data;
        setRequests(prev => [created, ...prev.filter(r => r.id !== created.id)]);
        setDraft(null);

        // Refresh notifications
        try {
          const notifsRes = await notificationsApi.getNotifications();
          if (notifsRes?.data) setNotifications(notifsRes.data);
        } catch {
          // Handled silently
        }

        return created;
      }
      throw new Error('Server did not return the created request.');
    } catch (err) {
      console.error('Failed to create request on server:', err);
      throw err;
    }
  };

  // Update request status (NGO, Admin)
  const updateRequestStatus = async (id, newStatus, customNote = null, actor = 'System Desk') => {
    try {
      const res = await requestsApi.updateStatus(id, newStatus, customNote);
      if (res && res.data) {
        const updated = res.data;
        setRequests(prev => prev.map(req => (req.id === id || req._id === id ? updated : req)));

        // Refresh notifications
        try {
          const notifsRes = await notificationsApi.getNotifications();
          if (notifsRes?.data) setNotifications(notifsRes.data);
        } catch {
          // Handled silently
        }

        return { success: true, data: updated };
      }
      return { success: false, error: 'Server did not return updated request.' };
    } catch (err) {
      console.error('Failed to update request status on server:', err);
      return { success: false, error: err.message || 'Status transition failed.' };
    }
  };

  // Advance request status simulation helper
  const advanceRequestStatus = async (id) => {
    const target = requests.find(r => r.id === id || r._id === id);
    if (!target) return null;

    const currentIndex = STATUS_STEPS.indexOf(target.status);
    const nextIndex = (currentIndex + 1) % STATUS_STEPS.length;
    const nextStatus = STATUS_STEPS[nextIndex];

    const res = await updateRequestStatus(id, nextStatus);
    return res.success ? nextStatus : null;
  };

  // General request updater
  const updateRequest = (id, fields) => {
    setRequests(prev =>
      prev.map(req => (req.id === id || req._id === id ? { ...req, ...fields } : req))
    );
  };

  // Fetch request by ID
  const getRequestById = (id) => {
    return requests.find(r => r.id === id || r._id === id) || null;
  };

  // ==========================================
  // Volunteer Workflow Actions
  // ==========================================
  const acceptVolunteerTask = async (requestId, volunteerUser) => {
    try {
      const res = await requestsApi.claimVolunteerTask(requestId);
      if (res && res.data) {
        const updated = res.data;
        setRequests(prev => prev.map(req => (req.id === requestId || req._id === requestId ? updated : req)));

        // Update volunteer stats in usersList if available
        if (volunteerUser?.id) {
          setUsersList(prev =>
            prev.map(u => (u.id === volunteerUser.id || u._id === volunteerUser.id ? { ...u, status: 'On Field Mission' } : u))
          );
        }

        return { success: true, data: updated };
      }
      return { success: false, error: 'Could not claim task.' };
    } catch (err) {
      console.error('Error claiming task on server:', err);
      return { success: false, error: err.message || 'Failed to claim task.' };
    }
  };

  const addVolunteerCheckIn = async (requestId, note, volunteerName = 'Volunteer') => {
    if (!String(note || '').trim()) {
      return { success: false, error: 'Add a progress note before submitting.' };
    }
    try {
      const res = await requestsApi.addVolunteerCheckIn(requestId, note.trim());
      if (res && res.data) {
        const updated = res.data;
        setRequests(prev => prev.map(req => (req.id === requestId || req._id === requestId ? updated : req)));
        return { success: true, data: updated };
      }
      return { success: false, error: 'Could not save check-in note.' };
    } catch (err) {
      console.error('Error adding check-in on server:', err);
      return { success: false, error: err.message || 'Failed to log progress check-in.' };
    }
  };

  const completeVolunteerTask = async (requestId, completionNote, proofDescription, volunteerUser) => {
    try {
      const res = await requestsApi.completeVolunteerTask(
        requestId,
        completionNote || 'Relief assistance delivered and signed off.',
        proofDescription || 'In-person verification confirmed.'
      );
      if (res && res.data) {
        const updated = res.data;
        setRequests(prev => prev.map(req => (req.id === requestId || req._id === requestId ? updated : req)));

        // Update volunteer stats in usersList
        if (volunteerUser?.id) {
          setUsersList(prev =>
            prev.map(u => (u.id === volunteerUser.id || u._id === volunteerUser.id ? { ...u, status: 'Available' } : u))
          );
        }

        return { success: true, data: updated };
      }
      return { success: false, error: 'Could not complete task.' };
    } catch (err) {
      console.error('Error completing task on server:', err);
      return { success: false, error: err.message || 'Failed to complete task.' };
    }
  };

  // ==========================================
  // NGO Operations Actions
  // ==========================================
  const assignVolunteerToRequest = async (requestId, volunteerId, volunteerName, ngoName = 'Helping Hands Foundation') => {
    try {
      const res = await requestsApi.assignVolunteer(requestId, volunteerId);
      if (res && res.data) {
        const updated = res.data;
        setRequests(prev => prev.map(req => (req.id === requestId || req._id === requestId ? updated : req)));

        // Update volunteer status in usersList
        setUsersList(prev =>
          prev.map(u => (u.id === volunteerId || u._id === volunteerId ? { ...u, status: 'On Field Mission' } : u))
        );

        return { success: true, data: updated };
      }
      return { success: false, error: 'Failed to assign volunteer.' };
    } catch (err) {
      console.error('Error assigning volunteer on server:', err);
      return { success: false, error: err.message || 'Volunteer assignment failed.' };
    }
  };

  const rejectRequest = async (requestId, reason, actorName = 'Field Review Desk', actorRole = 'ngo') => {
    return await updateRequestStatus(requestId, 'Rejected', reason, actorName);
  };

  // ==========================================
  // Resource Inventory Management
  // ==========================================
  const addResource = async (newResourceData, ngoName = 'Helping Hands Foundation') => {
    try {
      const qty = Number(newResourceData.quantity) || 0;
      const threshold = Number(newResourceData.minThreshold) || 20;

      const payload = {
        name: newResourceData.name?.trim(),
        category: newResourceData.category || 'Food & Water',
        quantity: qty,
        unit: newResourceData.unit || 'units',
        minThreshold: threshold,
        location: newResourceData.location || 'Panvel Central Depot',
        organization: newResourceData.organization || ngoName,
        notes: newResourceData.notes || ''
      };

      const res = await resourcesApi.createResource(payload);
      if (res && res.data) {
        const item = res.data;
        setResources(prev => [item, ...prev]);
        return item;
      }
      throw new Error('Failed to create resource item on server.');
    } catch (err) {
      console.error('Error creating resource on server:', err);
      throw err;
    }
  };

  const updateResourceQuantity = async (resourceId, newQuantity, actorName = 'Warehouse Lead') => {
    const qty = Math.max(0, Number(newQuantity) || 0);
    try {
      const res = await resourcesApi.updateResource(resourceId, { quantity: qty });
      if (res && res.data) {
        const updated = res.data;
        setResources(prev => prev.map(r => (r.id === resourceId || r._id === resourceId ? updated : r)));
        return updated;
      }
    } catch (err) {
      console.error('Error updating resource on server:', err);
      throw err;
    }
  };

  const markResourceUnavailable = async (resourceId, actorName = 'Warehouse Lead') => {
    try {
      const res = await resourcesApi.updateResource(resourceId, { status: 'Critical', quantity: 0 });
      if (res && res.data) {
        const updated = res.data;
        setResources(prev => prev.map(r => (r.id === resourceId || r._id === resourceId ? updated : r)));
        return updated;
      }
    } catch (err) {
      console.error('Error zeroing resource on server:', err);
      throw err;
    }
  };

  const allocateResource = async (requestId, resourceId, quantityToAllocate, actorName = 'Helping Hands Foundation') => {
    const qty = Number(quantityToAllocate);
    if (!Number.isSafeInteger(qty) || qty <= 0) {
      return { success: false, error: 'Enter a whole quantity greater than zero.' };
    }

    try {
      const res = await requestsApi.allocateResource(requestId, resourceId, qty);
      if (res && res.data) {
        const updatedRequest = res.data;
        setRequests(prev => prev.map(req => (req.id === requestId || req._id === requestId ? updatedRequest : req)));

        // Update local resource quantity
        setResources(prev =>
          prev.map(r => {
            if (r.id === resourceId || r._id === resourceId) {
              const remaining = res.remainingStock !== undefined ? res.remainingStock : Math.max(0, (r.quantity || 0) - qty);
              let status = 'In Stock';
              if (remaining === 0) status = 'Critical';
              else if (remaining <= (r.minThreshold || 20)) status = 'Low Stock';
              return { ...r, quantity: remaining, status, lastUpdated: getFormattedNow() };
            }
            return r;
          })
        );

        return { success: true, remaining: res.remainingStock, data: updatedRequest };
      }
      return { success: false, error: 'Resource allocation failed.' };
    } catch (err) {
      console.error('Error allocating resource on server:', err);
      return { success: false, error: err.message || 'Resource allocation failed.' };
    }
  };

  // ==========================================
  // Admin & Moderation Operations
  // ==========================================
  const verifyUser = async (userId, notes = '', adminName = 'System Administrator') => {
    try {
      const res = await adminApi.verifyUser(userId, notes || 'Verified');
      if (res && res.data) {
        const updated = res.data;
        setUsersList(prev => prev.map(u => (u.id === userId || u._id === userId ? updated : u)));
        return { success: true, data: updated };
      }
    } catch (err) {
      console.error('Error verifying user on server:', err);
      throw err;
    }
  };

  const rejectUser = async (userId, reason, adminName = 'System Administrator') => {
    try {
      const res = await adminApi.rejectUser(userId, reason || 'Rejected');
      if (res && res.data) {
        const updated = res.data;
        setUsersList(prev => prev.map(u => (u.id === userId || u._id === userId ? updated : u)));
        return { success: true, data: updated };
      }
    } catch (err) {
      console.error('Error rejecting user on server:', err);
      throw err;
    }
  };

  const flagRequest = async (requestId, reason, adminName = 'System Administrator') => {
    try {
      const res = await requestsApi.flagRequest(requestId, true, reason);
      if (res && res.data) {
        const updated = res.data;
        setRequests(prev => prev.map(r => (r.id === requestId || r._id === requestId ? updated : r)));
        return { success: true, data: updated };
      }
    } catch (err) {
      console.error('Error flagging request on server:', err);
      throw err;
    }
  };

  const unflagRequest = async (requestId, adminName = 'System Administrator') => {
    try {
      const res = await requestsApi.flagRequest(requestId, false, null);
      if (res && res.data) {
        const updated = res.data;
        setRequests(prev => prev.map(r => (r.id === requestId || r._id === requestId ? updated : r)));
        return { success: true, data: updated };
      }
    } catch (err) {
      console.error('Error unflagging request on server:', err);
      throw err;
    }
  };

  // Local audit log helper (client side tracking / backward compatibility)
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

  // ==========================================
  // Notification Helpers
  // ==========================================
  const markNotificationRead = async (notifId) => {
    try {
      await notificationsApi.markRead(notifId);
      setNotifications(prev =>
        prev.map(n => (n.id === notifId || n._id === notifId ? { ...n, unread: false } : n))
      );
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    } catch (err) {
      console.error('Error marking all notifications read:', err);
    }
  };

  const deleteNotification = async (notifId) => {
    try {
      await notificationsApi.deleteNotification(notifId);
      setNotifications(prev => prev.filter(n => n.id !== notifId && n._id !== notifId));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  // ==========================================
  // Citizen Draft Helpers
  // ==========================================
  const saveDraft = (data) => {
    setDraft(data);
  };

  const clearDraft = () => {
    setDraft(null);
  };

  // ==========================================
  // Database Reseed / Reset (Admin / Development)
  // ==========================================
  const resetToDefaultMockData = async () => {
    try {
      if (currentUser?.role === 'admin') {
        await adminApi.resetDemoData();
      }
    } catch (err) {
      console.warn('Server demo reset bypassed or non-admin:', err.message);
    } finally {
      await fetchData();
    }
  };

  // ==========================================
  // Dynamic Statistics
  // ==========================================
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
        loading,
        error,
        unreadNotificationsCount,
        refreshData: fetchData,
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
