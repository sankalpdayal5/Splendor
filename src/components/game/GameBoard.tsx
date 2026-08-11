import React, { useState, useEffect, useMemo } from 'react';
import { GameState, GameAction, GemColor, DevelopmentCard } from '../../engine/types.js';
import { canAffordCard } from '../../engine/gameEngine.js';
import { getTopRecommendedMoves, RecommendedMove } from '../../engine/aiEngine.js';
import { CardComponent } from './CardComponent.js';
import { NobleTile } from './NobleTile.js';
import { GemBank } from './GemBank.js';
import { PlayerPanel } from './PlayerPanel.js';
import { TurnActivityBanner } from './TurnActivityBanner.js';
import { ActionModal } from '../modals/ActionModal.js';
import { VictoryModal } from '../modals/VictoryModal.js';
import { ReserveModal } from '../modals/ReserveModal.js';
import { ReservedCardsModal } from '../modals/ReservedCardsModal.js';
import { BuyModal } from '../modals/BuyModal.js';
import { OwnedCardsModal } from '../modals/OwnedCardsModal.js';
import { LearnModeCoach } from '../coach/LearnModeCoach.js';
import { speechAnnouncer } from '../../utils/SpeechAnnouncer.js';
import { useViewport } from '../../utils/useViewport.js';
import { Haptics } from '../../utils/haptics.js';
import { Users, Check, AlertCircle } from 'lucide-react';

import { useGameBoardState } from './useGameBoardState.js';
import { PassAndPlayModal } from '../modals/PassAndPlayModal.js';

interface GameBoardProps {
  gameState: GameState;
  colorblindMode: boolean;
  learnMode?: boolean;
  isPassAndPlay?: boolean;
  onDispatchAction: (action: GameAction) => void;
  onRematch: () => void;
  onExitGame?: () => void;
  selfPlayerId?: string;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  colorblindMode,
  learnMode,
  isPassAndPlay,
  onDispatchAction,
  onRematch,
  onExitGame,
  selfPlayerId
}) => {
  const viewport = useViewport();
  const activePlayer = gameState.players[gameState.currentTurnIndex];
  const isSelfTurn = !selfPlayerId || activePlayer.id === selfPlayerId;

  // Encapsulated Custom Hook State & Memoized Handlers
  const {
    selectedGems,
    selectionError,
    mobileDrawerOpen,
    setMobileDrawerOpen,
    modalState,
    closeModal,
    handleClearGems,
    handleToggleGemSelection,
    handleConfirmTakeGems,
    handlePromptBuyGrid,
    handlePromptBuyReserved,
    handlePromptReserveGrid,
    handlePromptReserveDeck,
    handleConfirmBuy,
    handleConfirmReserve,
    handleOpenReservedCards,
    handleOpenOwnedCards
  } = useGameBoardState({
    gameState,
    isPassAndPlay,
    isSelfTurn,
    onDispatchAction
  });

  // AI Strategy Coach top 3 move recommendations
  const recommendations: RecommendedMove[] = useMemo(() => {
    if (!learnMode || !isSelfTurn || gameState.phase !== 'PHASE_ACTION') return [];
    return getTopRecommendedMoves(gameState, 3);
  }, [learnMode, isSelfTurn, gameState]);

  // Pre-computed O(1) recommendation badge lookup map
  const recommendationBadgeMap = useMemo(() => {
    const map = new Map<string, { rank: 1 | 2 | 3; color: string }>();
    recommendations.forEach((rec, idx) => {
      const rank = (idx + 1) as 1 | 2 | 3;
      const color = idx === 0 ? '#F59E0B' : idx === 1 ? '#10B981' : '#3B82F6';
      if (rec.action.type === 'BUY_GRID' || rec.action.type === 'RESERVE_GRID') {
        map.set(`${rec.action.tier}_${rec.action.slotIdx}`, { rank, color });
      }
    });
    return map;
  }, [recommendations]);

  const getCardRecommendationBadge = (tier: 1 | 2 | 3, slotIdx: number) => {
    return recommendationBadgeMap.get(`${tier}_${slotIdx}`);
  };

  const reservedModalPlayer = gameState.players.find(p => p.id === (modalState.type === 'RESERVED_CARDS' ? modalState.playerId : ''));
  const ownedModalPlayer = gameState.players.find(p => p.id === (modalState.type === 'OWNED_CARDS' ? modalState.playerId : ''));

  return (
    <div className={`game-container ${viewport.isMobile ? 'mobile-mode' : ''} ${viewport.isLandscape ? 'landscape-mode' : ''}`}>
      {/* LEFT COLUMN: Gem Bank Supply */}
      <GemBank
        bank={gameState.bank}
        selectedTokens={selectedGems}
        colorblindMode={colorblindMode}
        onSelectToken={handleToggleGemSelection}
      />

      {/* CENTER COLUMN: Main Board */}
      <main className="main-board">
        {/* AI Strategy Coach (Learn Mode) */}
        {learnMode && (
          <LearnModeCoach
            gameState={gameState}
            recommendations={recommendations}
            onExecuteRecommendation={(action) => {
              Haptics.cardAction();
              onDispatchAction(action);
            }}
          />
        )}

        {/* Nobles Row */}
        <section className="nobles-row" aria-label="Available Noble Visitors">
          {gameState.nobles.map(noble => (
            <NobleTile key={noble.id} noble={noble} colorblindMode={colorblindMode} />
          ))}
        </section>

        {/* Card Market Grid */}
        <section className="market-grid" aria-label="Development Card Market">
          {(['tier3', 'tier2', 'tier1'] as const).map((tierKey, idx) => {
            const tierNum = (3 - idx) as 1 | 2 | 3;
            const gridCards = gameState.tierGrid[tierKey];
            const deckCount = gameState.tierDecks[tierKey].length;

            return (
              <div key={tierKey} className="tier-row">
                {/* Deck Card */}
                <div
                  className={`tier-deck tier-${tierNum}`}
                  onClick={() => {
                    if (isSelfTurn && activePlayer.reservedCards.length < 3 && deckCount > 0) {
                      handlePromptReserveDeck(tierNum);
                    }
                  }}
                  title={isSelfTurn ? `Reserve face-down card from Tier ${tierNum} deck` : `Tier ${tierNum} deck`}
                >
                  <span>TIER {tierNum}</span>
                  <span className="deck-count">{deckCount}</span>
                </div>

                {/* 4 Face Up Grid Cards */}
                {gridCards.map((card, slotIdx) => {
                  const afford = card ? canAffordCard(activePlayer, card).canAfford : false;
                  const reservable = isSelfTurn && activePlayer.reservedCards.length < 3;
                  const recBadge = getCardRecommendationBadge(tierNum, slotIdx);

                  return (
                    <CardComponent
                      key={card ? card.id : `empty_${tierKey}_${slotIdx}`}
                      card={card}
                      canAfford={isSelfTurn && afford}
                      canReserve={reservable}
                      colorblindMode={colorblindMode}
                      recommendationBadge={recBadge}
                      onBuyCard={() => card && handlePromptBuyGrid(tierNum, slotIdx, card)}
                      onReserveCard={() => card && handlePromptReserveGrid(tierNum, slotIdx, card)}
                    />
                  );
                })}
              </div>
            );
          })}
        </section>

        {/* Selection Validation Error Alert */}
        {selectionError && (
          <div
            className="glass-panel"
            style={{
              background: 'rgba(220, 38, 38, 0.25)',
              border: '1.5px solid #EF4444',
              color: '#F8FAFC',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              margin: '8px 0',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
              animation: 'fadeIn 0.2s ease'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} color="#EF4444" />
              {selectionError}
            </span>
          </div>
        )}

        {/* Desktop Action Drawer Footer */}
        {!viewport.isMobile && (
          <footer className="action-drawer glass-panel" aria-label="Staged Gems Controls">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Staged Gems:</span>
              {selectedGems.length === 0 ? (
                <span style={{ fontSize: '0.85rem', color: '#64748B', fontStyle: 'italic' }}>
                  Tap gems from supply to select (3 distinct or 2 same)...
                </span>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  {selectedGems.map((col, i) => (
                    <span key={i} className={`gem-chip bg-${col}`} style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                      {col[0].toUpperCase()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {selectedGems.length > 0 && (
                <button className="btn-secondary" style={{ padding: '6px 12px', minHeight: '36px' }} onClick={handleClearGems}>
                  Clear
                </button>
              )}
              <button
                className="btn-primary"
                disabled={!isSelfTurn || selectedGems.length === 0}
                onClick={handleConfirmTakeGems}
              >
                Confirm Take Gems
              </button>
            </div>
          </footer>
        )}
      </main>

      {/* RIGHT COLUMN: Player HUD Panels */}
      <aside className={`players-column ${mobileDrawerOpen ? 'mobile-open' : ''}`}>
        {gameState.players.map((p, idx) => {
          const lastAction = gameState.moveHistory
            ?.slice()
            .reverse()
            .find((entry) => entry.playerId === p.id);

          return (
            <PlayerPanel
              key={p.id}
              player={p}
              isActive={idx === gameState.currentTurnIndex}
              colorblindMode={colorblindMode}
              lastActionDescription={lastAction?.description}
              onOpenReservedModal={() => handleOpenReservedCards(p.id)}
              onOpenOwnedCardsModal={() => handleOpenOwnedCards(p.id)}
            />
          );
        })}
      </aside>

      {/* Mobile Sticky Bottom Command Bar */}
      {viewport.isMobile && (
        <div className="mobile-bottom-bar">
          <button
            className="btn-secondary"
            style={{ padding: '6px 12px', minHeight: '44px', fontSize: '0.85rem' }}
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          >
            <Users size={18} /> Players ({gameState.players.length})
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {selectedGems.length > 0 && (
              <div style={{ display: 'flex', gap: '4px' }}>
                {selectedGems.map((col, i) => (
                  <span key={i} className={`gem-chip bg-${col}`} style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}>
                    {col[0].toUpperCase()}
                  </span>
                ))}
              </div>
            )}

            <button
              className="btn-primary"
              style={{ minHeight: '44px', padding: '6px 16px', fontSize: '0.85rem' }}
              disabled={!isSelfTurn || selectedGems.length === 0}
              onClick={handleConfirmTakeGems}
            >
              <Check size={16} /> Confirm Gems
            </button>
          </div>
        </div>
      )}

      {/* Tagged Union Modal Renderers (Guarantees Mutual Exclusion) */}
      {modalState.type === 'BUY' && (
        <BuyModal
          card={modalState.card}
          player={activePlayer}
          onConfirmBuy={handleConfirmBuy}
          onCancel={closeModal}
        />
      )}

      {modalState.type === 'RESERVE' && (
        <ReserveModal
          card={modalState.card || null}
          player={activePlayer}
          onConfirmReserve={handleConfirmReserve}
          onCancel={closeModal}
        />
      )}

      {modalState.type === 'RESERVED_CARDS' && reservedModalPlayer && (
        <ReservedCardsModal
          player={reservedModalPlayer}
          colorblindMode={colorblindMode}
          onBuyReservedCard={(card) => {
            const idx = reservedModalPlayer.reservedCards.findIndex((c) => c.id === card.id);
            if (idx !== -1) handlePromptBuyReserved(idx, card);
          }}
          onClose={closeModal}
        />
      )}

      {modalState.type === 'OWNED_CARDS' && ownedModalPlayer && (
        <OwnedCardsModal
          player={ownedModalPlayer}
          colorblindMode={colorblindMode}
          onClose={closeModal}
        />
      )}

      {modalState.type === 'PASS_AND_PLAY' && (
        <PassAndPlayModal
          player={activePlayer}
          turnNumber={gameState.turnNumber}
          onStartTurn={closeModal}
        />
      )}

      {/* Token Over-Limit / Noble Selection Action Modal */}
      {isSelfTurn && (gameState.phase === 'PHASE_DISCARD' || gameState.phase === 'PHASE_NOBLE_SELECTION') && (
        <ActionModal
          gameState={gameState}
          onConfirmDiscard={(tokensToDiscard) => {
            Haptics.cardAction();
            onDispatchAction({ type: 'DISCARD_TOKENS', tokens: tokensToDiscard });
          }}
          onSelectNoble={(nobleId) => {
            Haptics.cardAction();
            onDispatchAction({ type: 'SELECT_NOBLE', nobleId });
          }}
        />
      )}

      {/* Victory Modal */}
      {gameState.winnerIds && gameState.winnerIds.length > 0 && (
        <VictoryModal
          gameState={gameState}
          onRematch={() => {
            Haptics.victoryFanfare();
            onRematch();
          }}
          onExitGame={() => {
            Haptics.gemPick();
            if (onExitGame) onExitGame();
            else onRematch();
          }}
        />
      )}
    </div>
  );
};
