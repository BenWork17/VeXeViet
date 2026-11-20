'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AudioLines,
  BookOpen,
  Bookmark,
  Bus,
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  Compass,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  Square,
  TrendingUp,
  Volume2,
  Wand2,
} from 'lucide-react';
import {
  AI_NEXT_GEN_FEATURES,
  AI_QUICK_PROMPTS,
  EXPLORE_DESTINATIONS,
  EXPLORE_VIBES,
  buildSearchRouteUrl,
  formatVndCurrency,
  matchDestinationsByAiPromptOrVibe,
  type AiMatchResult,
  type AiQuickPromptPreset,
  type BudgetLevel,
  type ExploreDestination,
  type ExploreRegion,
  type ExploreVibeId,
  type ScoredExploreDestination,
} from '@/lib/data/explore-destinations';

export interface AiExploreConciergeProps {
  /** Controlled or uncontrolled prompt query */
  promptQuery?: string;
  onPromptQueryChange?: (query: string) => void;
  /** Controlled or uncontrolled selected vibes */
  selectedVibes?: ExploreVibeId[];
  onToggleVibe?: (vibeId: ExploreVibeId) => void;
  onSetVibes?: (vibes: ExploreVibeId[]) => void;
  /** Optional region & budget filters */
  selectedRegion?: 'Tất cả' | ExploreRegion;
  selectedBudget?: 'Tất cả' | BudgetLevel;
  onBudgetChange?: (budget: 'Tất cả' | BudgetLevel) => void;
  /** Precomputed AI match result or computed internally */
  aiMatchResult?: AiMatchResult;
  onAiMatchChange?: (result: AiMatchResult, isActive: boolean) => void;
  /** Destination selection & reading callbacks */
  selectedDestinationIds?: string[];
  onToggleSelectDestination?: (destinationId: string) => void;
  onSelectMultipleDestinations?: (destinationIds: string[]) => void;
  onReadArticle?: (destination: ExploreDestination) => void;
  onResetAi?: () => void;
}

export function AiExploreConcierge({
  promptQuery: controlledQuery,
  onPromptQueryChange,
  selectedVibes: controlledVibes,
  onToggleVibe,
  onSetVibes,
  selectedRegion = 'Tất cả',
  selectedBudget: controlledBudget,
  onBudgetChange,
  aiMatchResult: externalMatchResult,
  onAiMatchChange,
  selectedDestinationIds = [],
  onToggleSelectDestination,
  onSelectMultipleDestinations,
  onReadArticle,
  onResetAi,
}: AiExploreConciergeProps) {
  const [internalQuery, setInternalQuery] = useState('');
  const [internalVibes, setInternalVibes] = useState<ExploreVibeId[]>([]);
  const [internalBudget, setInternalBudget] = useState<'Tất cả' | BudgetLevel>('Tất cả');
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [showNextGenShowcase, setShowNextGenShowcase] = useState(false);

  // Interactive demo states inside Next-Gen AI Showcase
  const [audioDestId, setAudioDestId] = useState<string>(EXPLORE_DESTINATIONS[0]?.id ?? '');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [visualDemoIndex, setVisualDemoIndex] = useState(0);

  const query = controlledQuery !== undefined ? controlledQuery : internalQuery;
  const selectedVibes = controlledVibes !== undefined ? controlledVibes : internalVibes;
  const budget = controlledBudget !== undefined ? controlledBudget : internalBudget;

  const isAiActive =
    query.trim().length > 0 || selectedVibes.length > 0 || budget !== 'Tất cả' || Boolean(activePresetId);

  const computedMatchResult = useMemo(() => {
    if (externalMatchResult) return externalMatchResult;
    return matchDestinationsByAiPromptOrVibe(
      query,
      selectedVibes,
      selectedRegion === 'Tất cả' ? undefined : selectedRegion,
      budget === 'Tất cả' ? undefined : budget,
    );
  }, [externalMatchResult, query, selectedVibes, selectedRegion, budget]);

  const topMatches: ScoredExploreDestination[] = computedMatchResult.matches.slice(0, 4);

  const handleQueryChange = (nextQuery: string) => {
    setInternalQuery(nextQuery);
    onPromptQueryChange?.(nextQuery);
    if (!nextQuery.trim()) {
      setActivePresetId(null);
    }
  };

  const handleToggleVibe = (vibeId: ExploreVibeId) => {
    setActivePresetId(null);
    if (onToggleVibe) {
      onToggleVibe(vibeId);
      return;
    }
    const next = selectedVibes.includes(vibeId)
      ? selectedVibes.filter((id) => id !== vibeId)
      : [...selectedVibes, vibeId];
    setInternalVibes(next);
    onSetVibes?.(next);
  };

  const handleApplyPreset = (preset: AiQuickPromptPreset) => {
    setActivePresetId(preset.id);
    setInternalQuery(preset.prompt);
    onPromptQueryChange?.(preset.prompt);
    setInternalVibes(preset.vibes);
    onSetVibes?.(preset.vibes);
    if (preset.budgetLevel) {
      setInternalBudget(preset.budgetLevel);
      onBudgetChange?.(preset.budgetLevel);
    } else {
      setInternalBudget('Tất cả');
      onBudgetChange?.('Tất cả');
    }
    const nextResult = matchDestinationsByAiPromptOrVibe(
      preset.prompt,
      preset.vibes,
      preset.region ?? (selectedRegion === 'Tất cả' ? undefined : selectedRegion),
      preset.budgetLevel,
    );
    onAiMatchChange?.(nextResult, true);
  };

  const handleBudgetSelect = (nextBudget: 'Tất cả' | BudgetLevel) => {
    setInternalBudget(nextBudget);
    onBudgetChange?.(nextBudget);
  };

  const handleResetAll = () => {
    setActivePresetId(null);
    setInternalQuery('');
    setInternalVibes([]);
    setInternalBudget('Tất cả');
    onPromptQueryChange?.('');
    onSetVibes?.([]);
    onBudgetChange?.('Tất cả');
    onResetAi?.();
    const defaultResult = matchDestinationsByAiPromptOrVibe('', []);
    onAiMatchChange?.(defaultResult, false);
  };

  const handleClipTopThree = () => {
    const topIds = topMatches.slice(0, 3).map((d) => d.id);
    if (onSelectMultipleDestinations) {
      onSelectMultipleDestinations(topIds);
    } else if (onToggleSelectDestination) {
      topIds.forEach((id) => {
        if (!selectedDestinationIds.includes(id)) {
          onToggleSelectDestination(id);
        }
      });
    }
  };

  const selectedAudioDest =
    EXPLORE_DESTINATIONS.find((d) => d.id === audioDestId) ?? EXPLORE_DESTINATIONS[0]!;
  const visualDemoDestinations = EXPLORE_DESTINATIONS.slice(0, 4);
  const currentVisualDest = visualDemoDestinations[visualDemoIndex] ?? EXPLORE_DESTINATIONS[0]!;

  return (
    <section
      id="ai-explore-concierge"
      aria-labelledby="ai-concierge-heading"
      className="w-full border-b-2 border-double border-border-strong bg-surface-soft/70 py-7 lg:py-9"
    >
      <div className="mx-auto w-full max-w-[1520px] px-5 sm:px-8 lg:px-10 xl:px-12">
        <div className="overflow-hidden rounded-2xl border border-border-strong bg-card shadow-sm">
          {/* Newspaper AI Desk Masthead Header */}
          <div className="flex flex-col gap-3 border-b border-border bg-accent/50 px-5 py-4 sm:px-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-0.5 font-mono text-[11px] font-extrabold uppercase tracking-wider text-primary-foreground">
                  <Sparkles className="h-3 w-3" aria-hidden="true" />
                  BAN BIÊN TẬP AI • BÁO CHÍ CÁ NHÂN HÓA
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  AI VIBE & PERSONA MATCHER + LẬP LỊCH TRÌNH VUI CHƠI
                </span>
              </div>
              <h2 id="ai-concierge-heading" className="text-xl text-foreground sm:text-2xl">
                Trợ Lý AI Thiết Kế Ấn Phẩm & Điểm Vui Chơi Theo Gu Của Bạn
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowNextGenShowcase((prev) => !prev)}
                aria-expanded={showNextGenShowcase}
                className="inline-flex items-center gap-2 rounded-xl border border-primary/35 bg-card px-3.5 py-2 text-xs font-bold text-foreground shadow-2xs transition-colors hover:border-primary hover:bg-accent"
              >
                <Wand2 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                <span>Hệ sinh thái 5 Tính năng AI Mới</span>
                {showNextGenShowcase ? (
                  <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                )}
              </button>

              {isAiActive && (
                <button
                  type="button"
                  onClick={handleResetAll}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border-strong bg-card px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Đặt lại AI</span>
                </button>
              )}
            </div>
          </div>

          {/* Main Interactive Prompt & Vibe Matcher Body */}
          <div className="space-y-5 p-5 sm:p-7">
            {/* Natural Language Prompt Input */}
            <div className="grid gap-3 lg:grid-cols-12 lg:items-center">
              <div className="relative lg:col-span-8">
                <Sparkles
                  className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-primary"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  placeholder="Nhập mong muốn chuyến đi: VD 'Chữa lành săn mây 3N2Đ', 'Đi biển lặn san hô cùng gia đình', 'Phượt Hà Giang tiết kiệm'..."
                  aria-label="Mô tả chuyến đi mong muốn để AI gợi ý"
                  className="h-12 w-full rounded-xl border border-input bg-field pr-28 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => onAiMatchChange?.(computedMatchResult, true)}
                  className="absolute top-1.5 right-1.5 inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary-deep"
                >
                  <Send className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Biên tập</span>
                </button>
              </div>

              {/* Budget Level Selector */}
              <div className="flex flex-wrap items-center gap-1.5 lg:col-span-4 lg:justify-end">
                <span className="mr-1 font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Ngân sách:
                </span>
                {(['Tất cả', 'Tiết kiệm', 'Cân bằng', 'Cao cấp'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    aria-pressed={budget === lvl}
                    onClick={() => handleBudgetSelect(lvl)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors ${
                      budget === lvl
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-border bg-surface-soft text-muted-foreground hover:border-primary/40 hover:text-foreground'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* 4 Quick Vibe Preset Chips */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  CHỦ ĐỀ BÁO CHÍ GỢI Ý NHANH (1-CLICK CURATION):
                </span>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
                {AI_QUICK_PROMPTS.map((preset) => {
                  const isPresetActive = activePresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      aria-pressed={isPresetActive}
                      className={`group flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all ${
                        isPresetActive
                          ? 'border-primary bg-accent shadow-2xs'
                          : 'border-border bg-surface-soft/60 hover:border-primary/50 hover:bg-card'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded bg-card px-2 py-0.5 font-mono text-[10px] font-bold text-primary">
                          {preset.badge}
                        </span>
                        <Sparkles
                          className={`h-3.5 w-3.5 transition-transform group-hover:scale-110 ${
                            isPresetActive ? 'text-primary' : 'text-muted-foreground'
                          }`}
                          aria-hidden="true"
                        />
                      </div>
                      <p className="mt-2 text-sm font-bold text-foreground">{preset.label}</p>
                      <p className="mt-0.5 line-clamp-1 text-xs font-normal text-muted-foreground">
                        {preset.prompt}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Individual Travel Vibe Pills */}
            <div className="flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
              <span className="mr-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Phong cách trải nghiệm:
              </span>
              {EXPLORE_VIBES.map((vibe) => {
                const isSelected = selectedVibes.includes(vibe.id);
                return (
                  <button
                    key={vibe.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => handleToggleVibe(vibe.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all ${
                      isSelected
                        ? 'border border-primary bg-primary text-primary-foreground shadow-2xs'
                        : 'border border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent'
                    }`}
                  >
                    <span>{vibe.shortLabel}</span>
                  </button>
                );
              })}
            </div>

            {/* AI Editorial Summary & Top Matched Destinations Ribbon */}
            <div className="rounded-2xl border border-primary/30 bg-accent/45 p-4 sm:p-5">
              <div className="flex flex-col gap-3 border-b border-primary/20 pb-3.5 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 font-mono text-xs font-extrabold uppercase tracking-wider text-primary">
                      <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                      LỜI BÌNH BIÊN TẬP AI (REAL-TIME CURATION)
                    </span>
                    <span className="rounded-full bg-card px-2.5 py-0.5 font-mono text-[11px] font-bold text-foreground">
                      Gợi ý {computedMatchResult.suggestedDurationDays} ngày • Dự toán ~
                      {formatVndCurrency(computedMatchResult.estimatedTotalBudget)}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed font-semibold text-foreground">
                    {computedMatchResult.editorialSummary}
                  </p>
                  <p className="text-xs text-muted-foreground">{computedMatchResult.explanation}</p>
                </div>

                <button
                  type="button"
                  onClick={handleClipTopThree}
                  className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-2xs transition-colors hover:bg-primary-deep lg:self-center"
                >
                  <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Ghim Top 3 gợi ý AI vào Sổ tay</span>
                </button>
              </div>

              {/* 4 Curated Destination Mini-Cards */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {topMatches.map((item, idx) => {
                  const isClipped = selectedDestinationIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className="flex flex-col justify-between rounded-xl border border-border bg-card p-3.5 shadow-2xs transition-all hover:border-primary/50"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[11px] font-bold text-muted-foreground">
                            #{idx + 1} • {item.region}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 font-mono text-[11px] font-extrabold text-primary">
                            {item.matchPercentage}% hợp gu
                          </span>
                        </div>

                        <h3 className="mt-1.5 line-clamp-1 text-base font-normal text-foreground">
                          <button
                            type="button"
                            onClick={() => onReadArticle?.(item)}
                            className="text-left hover:text-primary"
                          >
                            {item.displayLocation}
                          </button>
                        </h3>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                          {item.title}
                        </p>

                        {/* AI Reasoning Badges */}
                        <div className="mt-2.5 space-y-1">
                          {item.matchReasons.slice(0, 2).map((reason, rIdx) => (
                            <p
                              key={rIdx}
                              className="line-clamp-1 rounded bg-surface-soft px-2 py-1 text-[11px] font-medium text-foreground"
                            >
                              • {reason}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-2.5">
                        <span className="font-mono text-[11px] font-bold text-primary">
                          Xe từ {item.busPriceFormatted}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onReadArticle?.(item)}
                            className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px] font-bold text-foreground hover:border-primary hover:text-primary"
                          >
                            <BookOpen className="h-3 w-3" aria-hidden="true" />
                            <span>Đọc</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onToggleSelectDestination?.(item.id)}
                            aria-pressed={isClipped}
                            className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold transition-colors ${
                              isClipped
                                ? 'bg-primary text-primary-foreground'
                                : 'border border-primary/40 bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground'
                            }`}
                          >
                            {isClipped ? (
                              <>
                                <Check className="h-3 w-3" aria-hidden="true" />
                                <span>Đã ghim</span>
                              </>
                            ) : (
                              <>
                                <Bookmark className="h-3 w-3" aria-hidden="true" />
                                <span>Ghim</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Collapsible Next-Gen AI Feature Showcase Drawer */}
            {showNextGenShowcase && (
              <div className="hn-fade-in space-y-5 rounded-2xl border border-border-strong bg-surface-soft p-5">
                <div className="flex flex-col gap-1 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="font-mono text-[11px] font-extrabold uppercase tracking-widest text-primary">
                      PHÒNG LAB DU LỊCH THÔNG MINH VEXÉVIET AI
                    </span>
                    <h3 className="text-lg text-foreground sm:text-xl">
                      5 Công Nghệ AI Thế Hệ Mới Cho Hành Trình Khám Phá Việt Nam
                    </h3>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">
                    Trải nghiệm trực tiếp Audio Báo Nói & Nhận diện Điểm đến bên dưới
                  </span>
                </div>

                {/* 5 Feature Cards */}
                <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
                  {AI_NEXT_GEN_FEATURES.map((feat) => (
                    <div
                      key={feat.id}
                      className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-2xs"
                    >
                      <div className="space-y-2">
                        <span className="inline-block rounded bg-accent px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-accent-foreground">
                          {feat.badge}
                        </span>
                        <h4 className="text-base leading-snug text-foreground">{feat.title}</h4>
                        <p className="text-xs font-bold text-primary">{feat.subtitle}</p>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {feat.description}
                        </p>
                      </div>
                      <div className="mt-3 border-t border-border pt-2.5 font-mono text-[11px] font-semibold text-foreground">
                        <TrendingUp className="mr-1 inline h-3.5 w-3.5 text-primary" aria-hidden="true" />
                        {feat.liveMetric}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Interactive Demo Widgets: 1) AI Audio Magazine Narrator & 2) AI Visual Spot Finder */}
                <div className="grid gap-4 lg:grid-cols-2">
                  {/* Demo 1: AI Audio Magazine Narrator */}
                  <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4 text-primary" aria-hidden="true" />
                        <span className="font-mono text-xs font-extrabold uppercase tracking-wider text-foreground">
                          BÁO NÓI AI TRÊN XE KHÁCH (AUDIO MAGAZINE PREVIEW)
                        </span>
                      </div>
                      <select
                        value={audioDestId}
                        onChange={(e) => {
                          setAudioDestId(e.target.value);
                          setIsPlayingAudio(false);
                        }}
                        aria-label="Chọn địa danh nghe tóm tắt báo nói AI"
                        className="rounded-lg border border-input bg-field px-2.5 py-1 text-xs font-semibold text-foreground"
                      >
                        {EXPLORE_DESTINATIONS.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.displayLocation}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-3 space-y-3">
                      <p className="rounded-lg bg-surface-soft p-3 text-xs leading-relaxed italic text-foreground">
                        “{selectedAudioDest.aiAudioSummary}”
                      </p>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setIsPlayingAudio((p) => !p)}
                          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary-deep"
                        >
                          {isPlayingAudio ? (
                            <>
                              <Square className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Tạm dừng bản tin Audio AI</span>
                            </>
                          ) : (
                            <>
                              <Play className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Nghe thuyết minh điểm đến (01:15)</span>
                            </>
                          )}
                        </button>
                        {isPlayingAudio && (
                          <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-primary">
                            <AudioLines className="h-4 w-4 animate-pulse" aria-hidden="true" />
                            Đang phát bản tin di sản...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Demo 2: AI Visual Spot Finder */}
                  <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                      <div className="flex items-center gap-2">
                        <Camera className="h-4 w-4 text-primary" aria-hidden="true" />
                        <span className="font-mono text-xs font-extrabold uppercase tracking-wider text-foreground">
                          AI VISUAL SPOT FINDER (NHẬN DIỆN TỌA ĐỘ QUA ẢNH)
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {visualDemoDestinations.map((d, idx) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => setVisualDemoIndex(idx)}
                            className={`rounded px-2 py-0.5 font-mono text-[11px] font-bold ${
                              visualDemoIndex === idx
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-surface-soft text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            Ảnh #{idx + 1}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <img
                        src={currentVisualDest.heroImage}
                        alt={currentVisualDest.displayLocation}
                        className="h-20 w-28 shrink-0 rounded-lg border border-border object-cover"
                      />
                      <div className="min-w-0 flex-1 space-y-1 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-foreground">
                            AI Định danh: {currentVisualDest.displayLocation}
                          </span>
                          <span className="rounded bg-accent px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary">
                            Khớp 98.4%
                          </span>
                        </div>
                        <p className="line-clamp-1 text-muted-foreground">
                          Mùa đẹp nhất: {currentVisualDest.bestMonths} • Tọa độ:{' '}
                          {currentVisualDest.coordinates[0].toFixed(2)}°N,{' '}
                          {currentVisualDest.coordinates[1].toFixed(2)}°E
                        </p>
                        <div className="flex items-center gap-3 pt-1">
                          <Link
                            href={buildSearchRouteUrl(currentVisualDest)}
                            className="inline-flex items-center gap-1 font-bold text-primary hover:underline"
                          >
                            <Bus className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>
                              Tuyến {currentVisualDest.suggestedOrigin} → {currentVisualDest.province} (
                              {currentVisualDest.busPriceFormatted})
                            </span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => onReadArticle?.(currentVisualDest)}
                            className="inline-flex items-center gap-1 font-bold text-foreground hover:text-primary"
                          >
                            <Compass className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Xem bài báo</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
