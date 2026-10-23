import React from 'react';
import { 
  Clock, 
  Search, 
  CheckCircle2, 
  UserCheck, 
  Truck, 
  CheckCircle, 
  Archive 
} from 'lucide-react';
import Badge from './Badge';

export const StatusBadge = ({ status, className = '' }) => {
  switch (status) {
    case 'Submitted':
      return (
        <Badge variant="blue" icon={<Clock size={12} />} className={className}>
          Submitted
        </Badge>
      );
    case 'Under Verification':
      return (
        <Badge variant="amber" icon={<Search size={12} />} className={className}>
          Under Verification
        </Badge>
      );
    case 'Verified':
      return (
        <Badge variant="teal" icon={<CheckCircle2 size={12} />} className={className}>
          ✓ Verified
        </Badge>
      );
    case 'Matched':
      return (
        <Badge variant="purple" icon={<UserCheck size={12} />} className={className}>
          Matched
        </Badge>
      );
    case 'Assistance In Progress':
      return (
        <Badge variant="blue" icon={<Truck size={12} />} className={className}>
          Assistance In Progress
        </Badge>
      );
    case 'Completed':
      return (
        <Badge variant="green" icon={<CheckCircle size={12} />} className={className}>
          ✓ Completed
        </Badge>
      );
    case 'Closed':
      return (
        <Badge variant="slate" icon={<Archive size={12} />} className={className}>
          Closed
        </Badge>
      );
    default:
      return (
        <Badge variant="slate" className={className}>
          {status || 'Unknown'}
        </Badge>
      );
  }
};

export default StatusBadge;
