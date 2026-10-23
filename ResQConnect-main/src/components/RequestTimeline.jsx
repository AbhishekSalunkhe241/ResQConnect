import React from 'react';
import { 
  Check, 
  Clock, 
  Search, 
  CheckCircle2, 
  UserCheck, 
  Truck, 
  CheckCircle, 
  Archive,
  Circle
} from 'lucide-react';
import { STATUS_STEPS } from '../data/mockRequests';

export const RequestTimeline = ({ 
  currentStatus = 'Submitted', 
  timeline = [], 
  className = '' 
}) => {
  const currentIndex = STATUS_STEPS.indexOf(currentStatus);
  const activeIdx = currentIndex >= 0 ? currentIndex : 0;

  // Icons corresponding to each status
  const getStepIcon = (stepName, state) => {
    if (state === 'completed') {
      return <Check size={14} strokeWidth={3} />;
    }
    switch (stepName) {
      case 'Submitted':
        return <Clock size={14} />;
      case 'Under Verification':
        return <Search size={14} />;
      case 'Verified':
        return <CheckCircle2 size={14} />;
      case 'Matched':
        return <UserCheck size={14} />;
      case 'Assistance In Progress':
        return <Truck size={14} />;
      case 'Completed':
        return <CheckCircle size={14} />;
      case 'Closed':
        return <Archive size={14} />;
      default:
        return <Circle size={12} />;
    }
  };

  return (
    <div className={`request-timeline-container ${className}`.trim()}>
      <div className="request-timeline-list">
        {STATUS_STEPS.map((step, idx) => {
          const isCompleted = idx < activeIdx;
          const isCurrent = idx === activeIdx;
          const isPending = idx > activeIdx;

          // Find matching logged timeline entry
          const logEntry = timeline.find(t => t.step === step);

          return (
            <div 
              key={step} 
              className={`timeline-item ${isCurrent ? 'is-current' : ''} ${isCompleted ? 'is-completed' : ''} ${isPending ? 'is-pending' : ''}`}
            >
              {/* Connector line */}
              {idx < STATUS_STEPS.length - 1 && (
                <div 
                  className={`timeline-connector ${isCompleted ? 'connector-completed' : 'connector-pending'}`} 
                />
              )}

              {/* Node Icon */}
              <div 
                className={`timeline-node ${isCurrent ? 'node-current' : ''} ${isCompleted ? 'node-completed' : ''} ${isPending ? 'node-pending' : ''}`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {getStepIcon(step, isCompleted ? 'completed' : isCurrent ? 'current' : 'pending')}
              </div>

              {/* Step Information */}
              <div className="timeline-content">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`timeline-title ${isCurrent ? 'title-current' : isCompleted ? 'title-completed' : 'title-pending'}`}>
                    {step}
                  </span>

                  {isCurrent && (
                    <span className="timeline-current-pill">
                      Current Stage
                    </span>
                  )}

                  {logEntry?.timestamp && (
                    <span className="timeline-timestamp">
                      {logEntry.timestamp}
                    </span>
                  )}
                </div>

                {logEntry?.note && (
                  <p className="timeline-note">
                    {logEntry.note}
                  </p>
                )}

                {isCurrent && !logEntry?.note && (
                  <p className="timeline-note">
                    Current stage of request lifecycle. Next step will update as field coordinators proceed.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .request-timeline-container {
          position: relative;
          padding: 0.5rem 0;
        }
        .request-timeline-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          position: relative;
        }
        .timeline-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          position: relative;
        }
        .timeline-connector {
          position: absolute;
          left: 17px;
          top: 32px;
          bottom: -24px;
          width: 2px;
          z-index: 1;
        }
        .connector-completed {
          background-color: var(--color-teal-600);
        }
        .connector-pending {
          background-color: var(--border-default);
          border-left: 2px dashed var(--border-default);
          background: transparent;
        }
        .timeline-node {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          z-index: 2;
          transition: all 0.2s ease;
        }
        .node-completed {
          background-color: var(--color-teal-600);
          color: #FFFFFF;
          box-shadow: 0 0 0 3px var(--color-teal-50);
        }
        .node-current {
          background-color: var(--color-primary-600);
          color: #FFFFFF;
          box-shadow: 0 0 0 4px var(--color-primary-50), 0 0 12px rgba(2, 132, 199, 0.35);
          animation: pulseRing 2s infinite;
        }
        .node-pending {
          background-color: var(--bg-surface);
          color: var(--text-light);
          border: 2px solid var(--border-default);
        }
        .timeline-content {
          flex: 1;
          padding-top: 0.2rem;
        }
        .timeline-title {
          font-size: 0.95rem;
          font-weight: 700;
        }
        .title-completed {
          color: var(--text-primary);
        }
        .title-current {
          color: var(--color-primary-600);
          font-size: 1rem;
        }
        .title-pending {
          color: var(--text-muted);
          font-weight: 500;
        }
        .timeline-current-pill {
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          background-color: var(--color-primary-50);
          color: var(--color-primary-600);
          border: 1px solid var(--color-primary-600);
          padding: 0.15rem 0.5rem;
          border-radius: var(--radius-full);
          letter-spacing: 0.03em;
        }
        .timeline-timestamp {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-left: auto;
        }
        .timeline-note {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin: 0.3rem 0 0 0;
          line-height: 1.45;
        }
        @keyframes pulseRing {
          0% {
            box-shadow: 0 0 0 2px var(--color-primary-100), 0 0 0 0 rgba(2, 132, 199, 0.4);
          }
          70% {
            box-shadow: 0 0 0 6px var(--color-primary-50), 0 0 0 8px rgba(2, 132, 199, 0);
          }
          100% {
            box-shadow: 0 0 0 2px var(--color-primary-100), 0 0 0 0 rgba(2, 132, 199, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default RequestTimeline;
