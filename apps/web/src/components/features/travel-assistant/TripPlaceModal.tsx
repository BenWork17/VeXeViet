'use client';

import { Check, X } from 'lucide-react';
import { cn } from '@vexeviet/ui';
import type { TravelPlace } from './types';
import { CATEGORY_LABELS } from './data/city-guides';
import { formatMoney, getPlaceDetails, getPlaceRating } from './utils/itinerary-helpers';
import { LandmarkImage } from './TripMapPrimitives';

interface TripPlaceModalProps {
  place: TravelPlace;
  selected: boolean;
  selectedActivities: string[];
  onClose: () => void;
  onToggleActivity: (placeId: string, activity: string) => void;
  onAddPlace: (placeId: string) => void;
}

export function TripPlaceModal({
  place,
  selected,
  selectedActivities,
  onClose,
  onToggleActivity,
  onAddPlace,
}: TripPlaceModalProps) {
  const details = getPlaceDetails(place);

  return (
    <div
      data-place-modal="true"
      role="dialog"
      aria-labelledby="travel-place-dialog-title"
      className="travel-place-modal"
    >
      <div className="travel-place-modal-media">
        <LandmarkImage name={place.name} wikiSlug={place.wikiSlug} imageUrl={place.imageUrl} />
        <button
          type="button"
          onClick={onClose}
          className="travel-icon-button travel-place-modal-close"
          aria-label="Đóng thông tin địa điểm"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      <div className="travel-place-modal-body">
        <p className="travel-place-category">{CATEGORY_LABELS[place.category]}</p>
        <h2 id="travel-place-dialog-title" className="travel-place-modal-title">
          {place.name}
        </h2>
        <div className="travel-detail-metrics">
          <div className="travel-detail-metric">
            <p>Đánh giá</p>
            <strong>{getPlaceRating(place)}/5</strong>
          </div>
          <div className="travel-detail-metric">
            <p>Giờ đẹp</p>
            <strong>{place.bestTime}</strong>
          </div>
          <div className="travel-detail-metric">
            <p>Chi phí</p>
            <strong>{formatMoney(place.cost)}</strong>
          </div>
        </div>
        <p className="travel-place-modal-desc">{details.desc}</p>

        <div className="travel-panel--inset">
          <div className="travel-activity-head">
            <h3>Nên làm tại đây</h3>
            <span>
              {selectedActivities.length}/{details.activities.length}
            </span>
          </div>
          <div className="travel-activity-list">
            {details.activities.map((activity) => {
              const activitySelected = selectedActivities.includes(activity);
              return (
                <button
                  key={activity}
                  type="button"
                  onClick={() => onToggleActivity(place.id, activity)}
                  aria-pressed={activitySelected}
                  className={cn('travel-activity', activitySelected && 'is-selected')}
                >
                  <span className="travel-activity-check" aria-hidden="true">
                    <Check size={14} />
                  </span>
                  {activity}
                </button>
              );
            })}
          </div>
          {selectedActivities.length > 0 && (
            <p className="travel-selected-note">Đã chọn: {selectedActivities.join(', ')}</p>
          )}
        </div>

        <p className="travel-note travel-note--warm">{details.tip}</p>

        <button
          type="button"
          onClick={() => onAddPlace(place.id)}
          className="travel-button travel-button--primary"
        >
          {selected ? 'Đã thêm vào chuyến đi' : 'Thêm vào chuyến đi'}
        </button>
      </div>
    </div>
  );
}
