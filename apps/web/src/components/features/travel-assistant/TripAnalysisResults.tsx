'use client';

import { ChevronDown } from 'lucide-react';
import { cn } from '@vexeviet/ui';
import {
  ANALYSIS_STEPS,
  type AnalysisResult,
  type AnalysisState,
  type DeparturePoint,
  type LocalTransportOption,
  type RouteDirectionStep,
  type TravelPlace,
} from './types';
import { formatMoney, formatVND } from './utils/itinerary-helpers';

interface TripAnalysisResultsProps {
  analysisState: AnalysisState;
  analysisStepIndex: number;
  analysisResult: AnalysisResult | null;
  departureDate?: string | null;
  localTransport: LocalTransportOption | null;
  selectedPlaces: TravelPlace[];
  activeDayPlaces: TravelPlace[];
  departurePoint: DeparturePoint;
  routeDirections: RouteDirectionStep[][];
  directionsExpanded: boolean;
  onToggleDirectionsExpanded: () => void;
  expandedStopIndexes: number[];
  onToggleStopDetails: (index: number) => void;
  onHoverDirectionStep: (stepId: string | null) => void;
}

export function TripAnalysisResults({
  analysisState,
  analysisStepIndex,
  analysisResult,
  departureDate,
  localTransport,
  selectedPlaces,
  activeDayPlaces,
  departurePoint,
  routeDirections,
  directionsExpanded,
  onToggleDirectionsExpanded,
  expandedStopIndexes,
  onToggleStopDetails,
  onHoverDirectionStep,
}: TripAnalysisResultsProps) {
  if (analysisState === 'idle') {
    return (
      <p className="travel-empty-state rounded-xl! border! border-border! bg-card! p-4! shadow-xs">
        Lịch trình gợi ý sẽ xuất hiện sau khi bạn chọn đủ phương tiện và địa điểm rồi bấm phân tích.
      </p>
    );
  }

  if (analysisState === 'loading') {
    return (
      <div
        className="travel-panel travel-analysis-loading bg-card! border! border-border! rounded-xl! p-4! shadow-xs"
        role="status"
        aria-live="polite"
      >
        <h2 className="travel-panel-title">Đang phân tích lộ trình</h2>
        <p className="travel-analysis-step">{ANALYSIS_STEPS[analysisStepIndex]}</p>
        <div className="travel-progress travel-progress--stepped" aria-hidden="true">
          <span style={{ transform: `scaleX(${(analysisStepIndex + 1) / ANALYSIS_STEPS.length})` }} />
        </div>
      </div>
    );
  }

  return (
    <div className="travel-analysis">
      <div className="travel-panel">
        <h2 className="travel-panel-title">Lộ trình đề xuất</h2>
        <dl className="travel-ledger">
          <div className="travel-ledger-row">
            <dt>Ngày đi</dt>
            <dd>{departureDate || 'Đang cập nhật'}</dd>
          </div>
          <div className="travel-ledger-row">
            <dt>Phương tiện nội đô</dt>
            <dd>{localTransport ? localTransport.label : 'Chưa chọn'}</dd>
          </div>
        </dl>
      </div>

      {selectedPlaces.map((place, index) => (
        <div key={place.id} className="travel-analysis-place">
          <span className="travel-analysis-index">{index + 1}</span>
          <div>
            <div className="travel-analysis-place-head">
              <h3 className="travel-analysis-place-name">{place.name}</h3>
              <span className="travel-analysis-place-time">{place.bestTime}</span>
            </div>
            <p className="travel-analysis-place-desc">{place.description}</p>
            <p className="travel-analysis-place-metrics">
              <span>{place.durationHours} giờ</span>
              <span>{formatMoney(place.cost)}</span>
            </p>
          </div>
        </div>
      ))}

      {analysisResult && (
        <>
          <div className="travel-panel">
            <h2 className="travel-panel-title">Lộ trình đề xuất</h2>
            <p className="travel-result-text">{analysisResult.routeExplanation}</p>
          </div>

          <div className="travel-panel">
            <h2 className="travel-panel-title">Chi phí tham quan và dịch vụ</h2>
            <div className="travel-stop-cost-list">
              {analysisResult.stops.map((stop, index) => (
                <div key={stop.place + index} className="travel-stop-cost">
                  <div className="travel-stop-cost-head">
                    <span className="travel-stop-cost-number">{stop.order}</span>
                    <p className="travel-stop-cost-name">{stop.place}</p>
                  </div>
                  <div className="travel-stop-cost-lines">
                    {stop.activityCost.entranceFee.min > 0 && (
                      <p>
                        Vào cửa
                        <span className="travel-cost-value">
                          {formatVND(stop.activityCost.entranceFee.min)} –{' '}
                          {formatVND(stop.activityCost.entranceFee.max)}
                        </span>
                      </p>
                    )}
                    {stop.activityCost.servicesCost.min > 0 && (
                      <p>
                        Dịch vụ
                        <span className="travel-cost-value">
                          {formatVND(stop.activityCost.servicesCost.min)} –{' '}
                          {formatVND(stop.activityCost.servicesCost.max)}
                        </span>
                      </p>
                    )}
                    {stop.activityCost.note && <p className="travel-cost-note">{stop.activityCost.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="travel-panel">
            <h2 className="travel-panel-title">Chi phí di chuyển ({localTransport?.label || 'Chưa chọn'})</h2>
            <div className="travel-stop-cost-list">
              {analysisResult.stops.map((stop, index) => (
                <div key={stop.place + '-transport-' + index} className="travel-stop-cost">
                  {stop.transportFromPrevious.totalCost.min > 0 && (
                    <>
                      <p className="travel-stop-cost-name">
                        {index === 0 ? departurePoint.name : analysisResult.stops[index - 1]?.place} → {stop.place}
                      </p>
                      <div className="travel-stop-cost-lines">
                        <p>
                          Quãng đường
                          <span className="travel-cost-value">
                            {stop.transportFromPrevious.distanceKm.toFixed(1)} km ×{' '}
                            {formatVND(stop.transportFromPrevious.costPerKm.min)} –{' '}
                            {formatVND(stop.transportFromPrevious.costPerKm.max)}/km
                          </span>
                        </p>
                        <p>
                          Tổng chặng
                          <span className="travel-cost-value">
                            {formatVND(stop.transportFromPrevious.totalCost.min)} –{' '}
                            {formatVND(stop.transportFromPrevious.totalCost.max)}
                          </span>
                        </p>
                        {stop.transportFromPrevious.note && (
                          <p className="travel-cost-note">{stop.transportFromPrevious.note}</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="travel-panel">
            <h2 className="travel-panel-title">Dự toán chi phí</h2>
            <dl className="travel-cost-list">
              <div className="travel-cost-row">
                <dt>Tham quan và dịch vụ</dt>
                <dd>
                  {formatVND(analysisResult.totalSummary.activityCostTotal.min)} –{' '}
                  {formatVND(analysisResult.totalSummary.activityCostTotal.max)}
                </dd>
              </div>
              <div className="travel-cost-row">
                <dt>Di chuyển</dt>
                <dd>
                  {formatVND(analysisResult.totalSummary.transportCostTotal.min)} –{' '}
                  {formatVND(analysisResult.totalSummary.transportCostTotal.max)}
                </dd>
              </div>
              <div className="travel-cost-row travel-cost-total">
                <dt>Tổng cộng mỗi người</dt>
                <dd>
                  {formatVND(analysisResult.totalSummary.grandTotal.min)} –{' '}
                  {formatVND(analysisResult.totalSummary.grandTotal.max)}
                </dd>
              </div>
            </dl>
          </div>
        </>
      )}

      {routeDirections.length > 0 && (
        <div className="travel-panel travel-directions">
          <button
            type="button"
            onClick={onToggleDirectionsExpanded}
            className="travel-directions-toggle"
            aria-expanded={directionsExpanded}
          >
            <span className="travel-directions-title">Lộ trình gợi ý</span>
            <span className="travel-directions-meta">
              {activeDayPlaces.length} điểm
              <ChevronDown
                className={cn('travel-directions-chevron', directionsExpanded && 'is-open')}
                size={18}
                aria-hidden="true"
              />
            </span>
          </button>

          {directionsExpanded && (
            <div className="travel-directions-body">
              <div className="travel-direction-start">
                <div className="travel-direction-rail">
                  <span className="travel-direction-marker">Đi</span>
                  {activeDayPlaces.length > 0 && <span className="travel-direction-line" aria-hidden="true" />}
                </div>
                <div className="travel-direction-copy">
                  <h4>Xuất phát</h4>
                  <p>{departurePoint.label}</p>
                </div>
              </div>

              {activeDayPlaces.map((place, stopIndex) => {
                const steps = routeDirections[stopIndex] ?? [];
                const expanded = expandedStopIndexes.includes(stopIndex);
                const legDistance = steps.reduce((total, step) => total + step.distance, 0);
                const speedKmh =
                  localTransport?.id === 'walk'
                    ? 5
                    : localTransport?.id === 'bus'
                      ? 20
                      : localTransport?.id === 'car4' || localTransport?.id === 'car7'
                        ? 28
                        : 24;
                const minutes = Math.max(3, Math.round((legDistance / 1000 / speedKmh) * 60));

                return (
                  <div key={place.id} className="travel-direction-item">
                    <button
                      type="button"
                      onClick={() => onToggleStopDetails(stopIndex)}
                      className="travel-direction-item-toggle"
                      aria-expanded={expanded}
                    >
                      <span className="travel-direction-rail">
                        <span className="travel-direction-number">{stopIndex + 2}</span>
                        {stopIndex < activeDayPlaces.length - 1 && (
                          <span className="travel-direction-line" aria-hidden="true" />
                        )}
                      </span>
                      <span className="travel-direction-main">
                        <span className="travel-direction-head">
                          <span className="travel-direction-name">{place.name}</span>
                          <span className="travel-direction-minutes">~{minutes} phút</span>
                        </span>
                        <span className={cn('travel-direction-steps', expanded && 'is-open')}>
                          {steps.slice(0, expanded ? 6 : 2).map((step) => (
                            <span
                              key={step.id}
                              onMouseEnter={() => onHoverDirectionStep(step.id)}
                              onMouseLeave={() => onHoverDirectionStep(null)}
                              className="travel-direction-step"
                            >
                              {step.instruction} {step.streetName}
                            </span>
                          ))}
                          {steps.length === 0 && (
                            <span className="travel-direction-step">Đang cập nhật hướng dẫn đường phố</span>
                          )}
                        </span>
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
