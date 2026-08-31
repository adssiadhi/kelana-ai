import TripCard from "./TripCard";
import { Trip } from "@/lib/types";

interface TripListProps {
  trips:     Trip[];
  onDelete?: (id: number) => void;
  /** Extra Tailwind classes for the grid wrapper */
  className?: string;
}

/**
 * Responsive grid of TripCard components.
 * 1-column on mobile, 2-column on sm, 3-column on lg.
 */
export default function TripList({ trips, onDelete, className = "" }: TripListProps) {
  if (trips.length === 0) return null;

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
      role="list"
      aria-label="Trip list"
    >
      {trips.map((trip) => (
        <div key={trip.id} role="listitem">
          <TripCard trip={trip} onDelete={onDelete} />
        </div>
      ))}
    </div>
  );
}
