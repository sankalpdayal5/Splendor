import React, { useState, useEffect } from 'react';
import { GameState, GameAction, GemColor, DevelopmentCard } from '../engine/types.js';
import { canAffordCard } from '../engine/gameEngine.js';
import { getTopRecommendedMoves, RecommendedMove } from '../engine/aiEngine.js';
import { CardComponent } from './CardComponent.js';
import { NobleTile } from './NobleTile.js';
import { GemBank } from './GemBank.js';
import { PlayerPanel } from './PlayerPanel.js';
import { ActionModal } from './ActionModal.js';
import { VictoryModal } from './VictoryModal.js';
import { ReserveModal } from './ReserveModal.js';
import { ReservedCardsModal } from './ReservedCardsModal.js';
import { BuyModal } from './BuyModal.js';
import { OwnedCardsModal } from './OwnedCardsModal.js';
import { LearnModeCoach } from './LearnModeCoach.js';
import { speechAnnouncer } from '../utils/SpeechAnnouncer.js';
import { useViewport } from '../utils/useViewport.js';
import { Haptics } from '../utils/haptics.js';
import { Users, Check } from 'lucide-react';

interface GameBoardProps {
  gameState: GameState;
  colorblindMode: boolean;
  learnMode?: boolean;
  onDispatchAction: (action: GameAction) => void;
  onRematch: () => void;
  selfPlayerId?: string;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  colorblindMode,
  learnMode,
  onDispatchAction,
  onRematch,
  selfPlayerId
}) => {
  const viewport = useViewport();
  const activePlayer = gameState.players[gameState.currentTurnIndex];
  const isSelfTurn = !selfPlayerId || activePlayer.id === selfPlayerId;

  // Local staged token state
  const [selectedGems, setSelectedGems] = useState<GemColor[]>([]);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Pending Buy Confirmation state
  const [pendingBuy, setPendingBuy] = useState<{
    source: 'grid' | 'reserved';
    tier?: 1 | 2 | 3;
    slotIdx?: number;
    reservedIndex?: number;
    card: DevelopmentCard;
  } | null>(null);

  // Pending Reserve Confirmation state
  const [pendingReserve, setPendingReserve] = useState<{
    type: 'grid' | 'deck';
    tier: 1 | 2 | 3;
    slotIdx?: number;
    card?: DevelopmentCard | null;
  } | null>(null);

  // Modal target player IDs
  const [targetReservedPlayerId, setTargetReservedPlayerId] = useState<string | null>(null);
  const [targetOwnedPlayerId, setTargetOwnedPlayerId] = useState<string | null>(null);

  // Reset state when turn changes
  useEffect(() => {
    setSelectedGems([]);
    setPendingBuy(null);
    setPendingReserve(null);
    speechAnnouncer.announcePolite(`Turn ${gameState.turnNumber}: ${activePlayer.name}'s turn.`);
  }, [gameState.currentTurnIndex, gameState.turnNumber]);

  // Compute AI Recommendations for Visual Overlays
  const recommendations: RecommendedMove[] = (learnMode && isSelfTurn) ? getTopRecommendedMoves(gameState, 3) : [];

  const recommendedGems: GemColor[] = [];
  recommendations.forEach(rec => {
    if (rec.action.type === 'TAKE_3_DISTINCT') {
      recommendedGems.push(...rec.action.colors);
    } else if (rec.action.type === 'TAKE_2_SAME') {
      recommendedGems.push(rec.action.color);
    }
  });

  const getCardRecommendationBadge = (tier: 1 | 2 | 3, slotIdx: number): { rank: 1 | 2 | 3; color: string } | undefined => {
    for (let i = 0; i < recommendations.length; i++) {
      const rec = recommendations[i];
      if (rec.action.type === 'BUY_GRID' && rec.action.tier === tier && rec.action.slotIdx === slotIdx) {
        return { rank: (i + 1) as 1 | 2 | 3, color: i === 0 ? '#F59E0B' : i === 1 ? '#10B981' : '#3B82F6' };
      }
      if (rec.action.type === 'RESERVE_GRID' && rec.action.tier === tier && rec.action.slotIdx === slotIdx) {
        return { rank: (i + 1) as 1 | 2 | 3, color: i === 0 ? '#F59E0B' : i === 1 ? '#10B981' : '#3B82F6' };
      }
    }
    return undefined;
  };

  const handleToggleGemSelection = (color: GemColor) => {
    if (!isSelfTurn) return;
    Haptics.gemPick();

    setSelectedGems(prev => {
      // 1. Same color toggle (double pick)
      if (prev.length === 1 && prev[0] === color) {
        if ((gameState.bank[color] || 0) >= 4) {
          return [color, color];
        } else {
          speechAnnouncer.announcePolite(`Cannot take 2 ${color} gems. Need at least 4 in bank.`);
          return [];
        }
      }
      if (prev.length === 2 && prev[0] === color && prev[1] === color) {
        return [];
      }

      // 2. Distinct colors toggle
      if (prev.includes(color)) {
        return prev.filter(c => c !== color);
      }

      if (prev.length >= 3) {
        return [color];
      }

      return [...prev, color];
    });
  };

  const handleConfirmTakeGems = () => {
    if (!isSelfTurn || selectedGems.length === 0) return;
    Haptics.cardAction();

    if (selectedGems.length === 2 && selectedGems[0] === selectedGems[1]) {
      onDispatchAction({ type: 'TAKE_2_SAME', color: selectedGems[0] });
    } else if (selectedGems.length <= 3) {
      onDispatchAction({ type: 'TAKE_3_DISTINCT', colors: selectedGems });
    }
    setSelectedGems([]);
  };

  // Trigger Buy Confirmation Modal
  const handlePromptBuyGrid = (tier: 1 | 2 | 3, slotIdx: number, card: DevelopmentCard) => {
    if (!isSelfTurn) return;
    Haptics.gemPick();
    setPendingBuy({ source: 'grid', tier, slotIdx, card });
  };

  const handlePromptBuyReserved = (reservedIndex: number, card: DevelopmentCard) => {
    if (!isSelfTurn) return;
    Haptics.gemPick();
    setPendingBuy({ source: 'reserved', reservedIndex, card });
  };

  const handleConfirmBuy = () => {
    if (!pendingBuy) return;
    Haptics.cardAction();

    if (pendingBuy.source === 'grid' && pendingBuy.tier && pendingBuy.slotIdx !== undefined) {
      onDispatchAction({ type: 'BUY_GRID', tier: pendingBuy.tier, slotIdx: pendingBuy.slotIdx });
    } else if (pendingBuy.source === 'reserved' && pendingBuy.reservedIndex !== undefined) {
      onDispatchAction({ type: 'BUY_RESERVED', reservedIndex: pendingBuy.reservedIndex });
    }
    setPendingBuy(null);
    setTargetReservedPlayerId(null);
  };

  // Trigger Reserve Confirmation Modal
  const handlePromptReserveGrid = (tier: 1 | 2 | 3, slotIdx: number, card: DevelopmentCard | null) => {
    if (!isSelfTurn || activePlayer.reservedCards.length >= 3) return;
    Haptics.gemPick();
    setPendingReserve({ type: 'grid', tier, slotIdx, card });
  };

  const handlePromptReserveDeck = (tier: 1 | 2 | 3) => {
    if (!isSelfTurn || activePlayer.reservedCards.length >= 3) return;
    Haptics.gemPick();
    setPendingReserve({ type: 'deck', tier });
  };

  const handleConfirmReserve = () => {
    if (!pendingReserve) return;
    Haptics.cardAction();

    if (pendingReserve.type === 'grid' && pendingReserve.slotIdx !== undefined) {
      onDispatchAction({ type: 'RESERVE_GRID', tier: pendingReserve.tier, slotIdx: pendingReserve.slotIdx });
    } else if (pendingReserve.type === 'deck') {
      onDispatchAction({ type: 'RESERVE_DECK', tier: pendingReserve.tier });
    }
    setPendingReserve(null);
  };

  const reservedModalPlayer = gameState.players.find(p => p.id === targetReservedPlayerId);
  const ownedModalPlayer = gameState.players.find(p => p.id === targetOwnedPlayerId);

  return (
    <div className={`game-container ${viewport.isMobile ? 'mobile-mode' : ''} ${viewport.isLandscape ? 'landscape-mode' : ''}`}>
      {/* LEFT COLUMN: Gem Bank Supply */}
      <GemBank
        bank={gameState.bank}
        selectedGems={selectedGems}
        colorblindMode={colorblindMode}
        recommendedGemColors={recommendedGems}
        onToggleGemSelection={handleToggleGemSelection}
      />

      {/* CENTER COLUMN: Main Board */}
      <main className="main-board">
        {/* AI Strategy Coach (Learn Mode) */}
        {learnMode && (
          <LearnModeCoach
            gameState={gameState}
            isSelfTurn={isSelfTurn}
            onExecuteAction={(action) => {
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
                      onReserveCard={() => handlePromptReserveGrid(tierNum, slotIdx, card)}
                    />
                  );
                })}
              </div>
            );
          })}
        </section>

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
                <button className="btn-secondary" style={{ padding: '6px 12px', minHeight: '36px' }} onClick={() => setSelectedGems([])}>
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
        {gameState.players.map((p, idx) => (
          <PlayerPanel
            key={p.id}
            player={p}
            isActiveTurn={idx === gameState.currentTurnIndex}
            isSelf={!selfPlayerId || p.id === selfPlayerId}
            onOpenReservedModal={() => setTargetReservedPlayerId(p.id)}
            onOpenOwnedModal={() => setTargetOwnedPlayerId(p.id)}
          />
        ))}
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

      {/* Buy Confirmation Modal */}
      <BuyModal
        pendingBuy={pendingBuy}
        player={activePlayer}
        colorblindMode={colorblindMode}
        onConfirm={handleConfirmBuy}
        onCancel={() => setPendingBuy(null)}
      />

      {/* Reserve Confirmation Modal */}
      <ReserveModal
        pendingReserve={pendingReserve}
        goldAvailable={(gameState.bank.gold || 0) > 0}
        colorblindMode={colorblindMode}
        onConfirm={handleConfirmReserve}
        onCancel={() => setPendingReserve(null)}
      />

      {/* Reserved Cards Drawer Modal */}
      {targetReservedPlayerId && reservedModalPlayer && (
        <ReservedCardsModal
          player={reservedModalPlayer}
          isActiveTurn={isSelfTurn}
          colorblindMode={colorblindMode}
          onBuyReservedCard={(idx) => handlePromptBuyReserved(idx, reservedModalPlayer.reservedCards[idx])}
          onClose={() => setTargetReservedPlayerId(null)}
        />
      )}

      {/* Owned Cards Collection Drawer Modal */}
      {targetOwnedPlayerId && ownedModalPlayer && (
        <OwnedCardsModal
          player={ownedModalPlayer}
          colorblindMode={colorblindMode}
          onClose={() => setTargetOwnedPlayerId(null)}
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
        />
      )}
    </div>
  );
};
