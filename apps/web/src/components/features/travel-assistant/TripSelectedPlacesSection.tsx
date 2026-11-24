'use client';

import type { CSSProperties } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@vexeviet/ui';
import { DEFAULT_DAY_ROUTE_COLOR, type TravelPlace } from './types';
import { CATEGORY_LABELS } from './data/city-guides';
import {
  formatMoney,
  getPlaceDetails,
  getPlaceDistrict,
  getPlaceGalleryUrls,
  getPlaceRating,
  getPlaceTags,
  handlePlaceImageError,
} from './utils/itinerary-helpers';
import { LandmarkImage } from './TripMapPrimitives';

interface TripSelectedPlacesSectionProps {
  centerName: string;
  selectedPlaces: TravelPlace[];
  selectedPlaceDayMeta: Map<string, { day: number; color: string; order: number }>;
  activeDayIndex: number;
  expandedPlaceId: string | null;
  onToggleExpand: (placeId: string) => void;
  onTogglePlace: (placeId: string) => void;
}

export function TripSelectedPlacesSection({
  centerName,
  selectedPlaces,
  selectedPlaceDayMeta,
  activeDayIndex,
  expandedPlaceId,
  onToggleExpand,
  onTogglePlace,
}: TripSelectedPlacesSectionProps) {
  return (
    <section
      className="travel-places bg-card! border! border-border! rounded-xl! p-3.5! shadow-xs"
      aria-labelledby="travel-places-title"
    >
      <div className="travel-places-head">
        <h2 id="travel-places-title" className="travel-panel-title">
          Địa điểm đã chọn
        </h2>
        <p>{selectedPlaces.length} điểm trong lịch trình</p>
      </div>

      {selectedPlaces.length === 0 ? (
        <p className="travel-empty-state rounded-lg! border! border-dashed! border-border! bg-muted/40!">
          Chưa có địa điểm nào trong lịch trình. Chọn một điểm trên bản đồ rồi thêm vào chuyến đi.
        </p>
      ) : (
        selectedPlaces.map((place) => {
          const dayMeta = selectedPlaceDayMeta.get(place.id);
          const dayColor = dayMeta?.color ?? DEFAULT_DAY_ROUTE_COLOR;
          const tags = getPlaceTags(place, centerName);
          const details = getPlaceDetails(place);
          const expanded = expandedPlaceId === place.id;
          const categoryLabel = CATEGORY_LABELS[place.category];

          return (
            <article
              key={place.id}
              className={cn(
                'travel-place rounded-lg! border! border-border! bg-card! shadow-xs',
                expanded && 'is-expanded border-primary/40!',
              )}
              style={{ '--travel-day-color': dayColor } as CSSProperties}
            >
              <div className="travel-place-summary">
                <button
                  type="button"
                  onClick={() => onToggleExpand(place.id)}
                  className="travel-place-toggle"
                  aria-expanded={expanded}
                >
                  <span className="travel-place-image">
                    <LandmarkImage
                      name={place.name}
                      wikiSlug={place.wikiSlug || place.name}
                      imageUrl={place.imageUrl}
                    />
                  </span>
                  <span className="travel-place-copy">
                    <span className="travel-place-category">
                      {categoryLabel} · Ngày {dayMeta?.day ?? activeDayIndex + 1}
                    </span>
                    <span className="travel-place-name">{place.name}</span>
                    <span className="travel-place-desc">{place.description}</span>
                    <span className="travel-place-meta">
                      <span>{getPlaceRating(place)}/5 đánh giá</span>
                      <span>{place.bestTime}</span>
                      <span>{getPlaceDistrict(place, centerName)}</span>
                      <span>{formatMoney(place.cost)}</span>
                    </span>
                    <span className="travel-tags">
                      {tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="travel-tag">
                          {tag}
                        </span>
                      ))}
                    </span>
                    <span className="travel-place-foot">
                      {place.durationHours}h trải nghiệm · Đã thêm vào ngày{' '}
                      {dayMeta?.day ?? activeDayIndex + 1}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onTogglePlace(place.id);
                  }}
                  className="travel-place-remove"
                  aria-label={`Bỏ chọn ${place.name}`}
                >
                  <Check size={16} aria-hidden="true" />
                </button>
              </div>

              <div className={cn('travel-place-details', expanded && 'is-open')}>
                <div className="travel-detail-image">
                  {place.wikiSlug ? (
                    <LandmarkImage
                      wikiSlug={place.wikiSlug}
                      name={`${place.name} 1`}
                      imageUrl={place.imageUrl}
                    />
                  ) : (
                    <img
                      src={getPlaceGalleryUrls(place)[0]}
                      alt={`${place.name} 1`}
                      loading="lazy"
                      crossOrigin="anonymous"
                      className="travel-image"
                      onError={(event) => handlePlaceImageError(event, place)}
                    />
                  )}
                </div>

                <div className="travel-detail-metrics">
                  <div className="travel-detail-metric">
                    <p>Khung giờ</p>
                    <strong>{place.bestTime}</strong>
                  </div>
                  <div className="travel-detail-metric">
                    <p>Thời lượng</p>
                    <strong>{place.durationHours}h</strong>
                  </div>
                  <div className="travel-detail-metric">
                    <p>Chi phí</p>
                    <strong>{formatMoney(place.cost)}</strong>
                  </div>
                </div>

                <div className="travel-detail-block">
                  <h4>Mô tả ngắn</h4>
                  <p>{details.desc}</p>
                </div>

                <div className="travel-detail-block">
                  <h4>Hoạt động nổi bật</h4>
                  <ul className="travel-list">
                    {details.activities.map((activity) => (
                      <li key={activity}>{activity}</li>
                    ))}
                  </ul>
                </div>

                <div className="travel-note travel-note--warm">
                  <p>
                    <strong>Giờ mở cửa:</strong> {details.hours}
                  </p>
                  <p>
                    <strong>Kinh nghiệm:</strong> {details.tip}
                  </p>
                </div>
              </div>
            </article>
          );
        })
      )}
    </section>
  );
}
