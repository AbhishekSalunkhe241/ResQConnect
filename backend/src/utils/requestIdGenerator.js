import Request from '../models/Request.js';

/**
 * Generates the next sequential human-readable Request ID (e.g. RQ-1026)
 */
export const generateNextRequestId = async () => {
  const allRequests = await Request.find({}, 'id').lean();

  const numbers = allRequests
    .map((r) => {
      const match = r.id && r.id.match(/RQ-(\d+)/);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((n) => n !== null && !isNaN(n));

  const highest = numbers.length > 0 ? Math.max(...numbers) : 1025;
  return `RQ-${highest + 1}`;
};

/**
 * Helper to get formatted current time string matching frontend timestamps
 * e.g. "Oct 11, 08:30 PM"
 */
export const getFormattedTimestamp = () => {
  const now = new Date();
  const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateFormatted = now.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return `${dateFormatted}, ${timeFormatted}`;
};
