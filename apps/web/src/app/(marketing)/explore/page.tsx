'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  EXPLORE_DESTINATIONS,
  EXPLORE_VIBES,
  generateAiTripPlanFromSelection,
  getLeadDestination,
  matchDestinationsByAiPromptOrVibe,
  type BudgetLevel,
  type ExploreDestination,
  type ExploreVibeId,
  type ScoredExploreDestination,
} from '@/lib/data/explore-destinations';
import {
  AiExploreConcierge,
  Destination3DCameraModal,
  DestinationArticleModal,
  EditorialMasthead,
  EditorialNewspaperGrid,
  LeadStoryHero,
  TripClippingBar,
  type CategoryFilterValue,
  type RegionFilterValue,
} from '@/components/features/explore';
import { FadeIn } from '@/components/motion';

function normalizeSearchText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();
}

export default function ExplorePage() {
  // Newspaper Masthead Filters
  const [selectedRegion, setSelectedRegion] = useState<RegionFilterValue>('Tất cả');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilterValue>('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');

  // AI Vibe Matcher & Concierge State
  const [aiPromptQuery, setAiPromptQuery] = useState('');
  const [selectedVibes, setSelectedVibes] = useState<ExploreVibeId[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<'Tất cả' | BudgetLevel>('Tất cả');

  // Interactive Trip Clipping ("Sổ Tay Hành Trình") & Entertainment Checklists
  const [selectedDestinationIds, setSelectedDestinationIds] = useState<string[]>([]);
  const [selectedHighlightIds, setSelectedHighlightIds] = useState<string[]>([]);
  const [isTripDrawerOpen, setIsTripDrawerOpen] = useState(false);

  // Full Editorial Reader Modal State
  const [activeArticle, setActiveArticle] = useState<ExploreDestination | null>(null);

  // Interactive 3D Camera / Flycam Modal State
  const [active3DCameraDestination, setActive3DCameraDestination] =
    useState<ExploreDestination | null>(null);

  const aiConciergeSectionRef = useRef<HTMLDivElement>(null);

  const isAiFilterActive =
    aiPromptQuery.trim().length > 0 ||
    selectedVibes.length > 0 ||
    selectedBudget !== 'Tất cả';

  // Compute AI Match Result whenever AI inputs or region filter change
  const aiMatchResult = useMemo(() => {
    return matchDestinationsByAiPromptOrVibe(
      aiPromptQuery,
      selectedVibes,
      selectedRegion !== 'Tất cả' ? selectedRegion : undefined,
      selectedBudget !== 'Tất cả' ? selectedBudget : undefined,
    );
  }, [aiPromptQuery, selectedVibes, selectedRegion, selectedBudget]);

  // Active AI Filter badge label for the Masthead
  const activeAiFilterLabel = useMemo(() => {
    if (!isAiFilterActive) return null;
    const parts: string[] = [];
    if (selectedVibes.length > 0) {
      const labels = selectedVibes
        .map((id) => EXPLORE_VIBES.find((v) => v.id === id)?.shortLabel)
        .filter(Boolean);
      if (labels.length > 0) {
        parts.push(labels.join(', '));
      }
    }
    if (selectedBudget !== 'Tất cả') {
      parts.push(`Ngân sách ${selectedBudget}`);
    }
    if (aiPromptQuery.trim()) {
      const q = aiPromptQuery.trim();
      parts.push(`"${q.length > 26 ? `${q.slice(0, 26)}…` : q}"`);
    }
    return parts.join(' • ') || 'Đang lọc theo AI';
  }, [isAiFilterActive, selectedVibes, selectedBudget, aiPromptQuery]);

  // Filter & sort destinations for the Newspaper Grid and Lead Story
  const filteredDestinations = useMemo<
    Array<ExploreDestination | ScoredExploreDestination>
  >(() => {
    const sourceList: Array<ExploreDestination | ScoredExploreDestination> =
      isAiFilterActive ? aiMatchResult.matches : EXPLORE_DESTINATIONS;

    const normalizedSearch = normalizeSearchText(searchQuery);

    return sourceList.filter((dest) => {
      if (selectedRegion !== 'Tất cả' && dest.region !== selectedRegion) {
        return false;
      }
      if (selectedCategory !== 'Tất cả' && dest.category !== selectedCategory) {
        return false;
      }
      if (normalizedSearch.length > 0) {
        const searchableText = normalizeSearchText(
          [
            dest.title,
            dest.subtitle,
            dest.standfirst,
            dest.province,
            dest.displayLocation,
            dest.category,
            dest.region,
            dest.vibeTags.join(' '),
            dest.localSpecialties.join(' '),
            dest.highlights.map((h) => `${h.title} ${h.description}`).join(' '),
          ].join(' '),
        );
        if (!searchableText.includes(normalizedSearch)) {
          return false;
        }
      }
      return true;
    });
  }, [
    isAiFilterActive,
    aiMatchResult.matches,
    searchQuery,
    selectedRegion,
    selectedCategory,
  ]);

  // Determine the Front-Page Lead Story based on current AI or editorial filter state
  const leadDestination = useMemo<
    ExploreDestination | ScoredExploreDestination
  >(() => {
    if (isAiFilterActive && filteredDestinations.length > 0) {
      return filteredDestinations[0]!;
    }
    const explicitLead = filteredDestinations.find((d) => d.isLeadStory);
    return explicitLead ?? filteredDestinations[0] ?? getLeadDestination();
  }, [isAiFilterActive, filteredDestinations]);

  const leadAiMatchPercentage =
    isAiFilterActive && 'matchPercentage' in leadDestination
      ? leadDestination.matchPercentage
      : undefined;

  const leadAiMatchReasons =
    isAiFilterActive && 'matchReasons' in leadDestination
      ? leadDestination.matchReasons
      : undefined;

  // Compute AI-generated trip plan for the TripClippingBar
  const customTripPlan = useMemo(() => {
    return generateAiTripPlanFromSelection(
      selectedDestinationIds,
      selectedHighlightIds,
    );
  }, [selectedDestinationIds, selectedHighlightIds]);

  // Handlers
  const handleToggleVibe = useCallback((vibeId: ExploreVibeId) => {
    setSelectedVibes((prev) =>
      prev.includes(vibeId) ? prev.filter((item) => item !== vibeId) : [...prev, vibeId],
    );
  }, []);

  const handleToggleSelectDestination = useCallback((destinationId: string) => {
    setSelectedDestinationIds((prev) =>
      prev.includes(destinationId)
        ? prev.filter((id) => id !== destinationId)
        : [...prev, destinationId],
    );
  }, []);

  const handleRemoveDestination = useCallback((destinationId: string) => {
    const target = EXPLORE_DESTINATIONS.find((d) => d.id === destinationId);
    setSelectedDestinationIds((prev) => prev.filter((id) => id !== destinationId));
    if (target) {
      const targetHighlightIds = new Set(target.highlights.map((h) => h.id));
      setSelectedHighlightIds((prev) =>
        prev.filter((hId) => !targetHighlightIds.has(hId)),
      );
    }
  }, []);

  const handleSelectMultipleDestinations = useCallback((destinationIds: string[]) => {
    setSelectedDestinationIds((prev) => {
      const merged = new Set([...prev, ...destinationIds]);
      return Array.from(merged);
    });
    setIsTripDrawerOpen(true);
  }, []);

  const handleToggleHighlight = useCallback(
    (highlightId: string, destinationId?: string) => {
      setSelectedHighlightIds((prev) => {
        const isCurrentlySelected = prev.includes(highlightId);
        if (isCurrentlySelected) {
          return prev.filter((id) => id !== highlightId);
        }
        return [...prev, highlightId];
      });

      // Automatically clip the parent destination when a user ticks one of its entertainment highlights
      const parentDestinationId =
        destinationId ??
        EXPLORE_DESTINATIONS.find((d) =>
          d.highlights.some((h) => h.id === highlightId),
        )?.id;

      if (parentDestinationId) {
        setSelectedDestinationIds((prev) =>
          prev.includes(parentDestinationId) ? prev : [...prev, parentDestinationId],
        );
      }
    },
    [],
  );

  const handleClearAllClippings = useCallback(() => {
    setSelectedDestinationIds([]);
    setSelectedHighlightIds([]);
    setIsTripDrawerOpen(false);
  }, []);

  const handleResetAi = useCallback(() => {
    setAiPromptQuery('');
    setSelectedVibes([]);
    setSelectedBudget('Tất cả');
  }, []);

  const handleResetAllFilters = useCallback(() => {
    setSelectedRegion('Tất cả');
    setSelectedCategory('Tất cả');
    setSearchQuery('');
    setAiPromptQuery('');
    setSelectedVibes([]);
    setSelectedBudget('Tất cả');
  }, []);

  const handleScrollToAiConcierge = useCallback(() => {
    aiConciergeSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, []);

  const handleReadArticle = useCallback((destination: ExploreDestination) => {
    setActiveArticle(destination);
  }, []);

  const handleCloseArticleModal = useCallback(() => {
    setActiveArticle(null);
  }, []);

  const handleOpen3DCamera = useCallback((destination: ExploreDestination) => {
    setActive3DCameraDestination(destination);
  }, []);

  const handleClose3DCamera = useCallback(() => {
    setActive3DCameraDestination(null);
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      <FadeIn>
        {/* 1. Newspaper Masthead, Weather/Season Ticker & Filter Bar */}
        <EditorialMasthead
          selectedRegion={selectedRegion}
          onRegionChange={setSelectedRegion}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          totalArticlesCount={EXPLORE_DESTINATIONS.length}
          filteredArticlesCount={filteredDestinations.length}
          selectedTripCount={selectedDestinationIds.length}
          onOpenTripDrawer={() => setIsTripDrawerOpen(true)}
          onScrollToAiConcierge={handleScrollToAiConcierge}
          onResetFilters={handleResetAllFilters}
          activeAiFilterLabel={activeAiFilterLabel}
        />

        {/* 2. Front-Page Cover Story / Lead Feature */}
        <LeadStoryHero
          destination={leadDestination}
          isSelected={selectedDestinationIds.includes(leadDestination.id)}
          onToggleSelect={handleToggleSelectDestination}
          onReadArticle={handleReadArticle}
          onOpen3DCamera={handleOpen3DCamera}
          selectedHighlightIds={selectedHighlightIds}
          onToggleHighlight={handleToggleHighlight}
          aiMatchPercentage={leadAiMatchPercentage}
          aiMatchReasons={leadAiMatchReasons}
        />

        {/* 3. Interactive AI Vibe & Persona Matcher + Next-Gen AI Showcase */}
        <div ref={aiConciergeSectionRef}>
          <AiExploreConcierge
            promptQuery={aiPromptQuery}
            onPromptQueryChange={setAiPromptQuery}
            selectedVibes={selectedVibes}
            onToggleVibe={handleToggleVibe}
            onSetVibes={setSelectedVibes}
            selectedRegion={selectedRegion}
            selectedBudget={selectedBudget}
            onBudgetChange={setSelectedBudget}
            aiMatchResult={aiMatchResult}
            selectedDestinationIds={selectedDestinationIds}
            onToggleSelectDestination={handleToggleSelectDestination}
            onSelectMultipleDestinations={handleSelectMultipleDestinations}
            onReadArticle={handleReadArticle}
            onResetAi={handleResetAi}
          />
        </div>

        {/* 4. Multi-Column Editorial Newspaper Grid with Entertainment Checklists */}
        <EditorialNewspaperGrid
          destinations={filteredDestinations}
          selectedDestinationIds={selectedDestinationIds}
          onToggleSelectDestination={handleToggleSelectDestination}
          onReadArticle={handleReadArticle}
          onOpen3DCamera={handleOpen3DCamera}
          selectedHighlightIds={selectedHighlightIds}
          onToggleHighlight={handleToggleHighlight}
          showAiMatchBadge={isAiFilterActive}
          onResetFilters={handleResetAllFilters}
          sectionTitle={
            selectedRegion !== 'Tất cả'
              ? `Ấn Phẩm Chuyên Đề ${selectedRegion}: Danh Lam & Điểm Vui Chơi`
              : 'Chuyên Mục Danh Lam Thắng Cảnh & Điểm Vui Chơi Giải Trí'
          }
          sectionSubtitle={
            isAiFilterActive
              ? aiMatchResult.editorialSummary
              : 'Tích chọn các hoạt động vui chơi bạn yêu thích ngay trên từng bài báo để AI tổng hợp lộ trình & dự toán chi phí xe khách.'
          }
        />
      </FadeIn>

      {/* 5. Full Editorial Article Reader Modal */}
      <DestinationArticleModal
        destination={activeArticle}
        isOpen={Boolean(activeArticle)}
        onClose={handleCloseArticleModal}
        isSelected={
          activeArticle ? selectedDestinationIds.includes(activeArticle.id) : false
        }
        onToggleSelect={handleToggleSelectDestination}
        selectedHighlightIds={selectedHighlightIds}
        onToggleHighlight={handleToggleHighlight}
      />

      {/* 6. Interactive 3D Camera / Flycam Viewfinder Modal */}
      <Destination3DCameraModal
        destination={active3DCameraDestination}
        isOpen={Boolean(active3DCameraDestination)}
        onClose={handleClose3DCamera}
        selectedHighlightIds={selectedHighlightIds}
        onToggleHighlight={handleToggleHighlight}
      />

      {/* 6. Floating "Sổ Tay Hành Trình" & AI Multi-Day Trip Planner Drawer */}
      <TripClippingBar
        selectedDestinationIds={selectedDestinationIds}
        selectedHighlightIds={selectedHighlightIds}
        onRemoveDestination={handleRemoveDestination}
        onToggleSelectDestination={handleToggleSelectDestination}
        onClearAll={handleClearAllClippings}
        onReadArticle={handleReadArticle}
        isOpen={isTripDrawerOpen}
        onOpenChange={setIsTripDrawerOpen}
        customTripPlan={customTripPlan}
      />
    </div>
  );
}
