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
  const activePlayer = gameState.players[gameState.currentTurnIndex];
  const isSelfTurn = !selfPlayerId || activePlayer.id === selfPlayerId;

  // Local staged token state
  const [selectedGems, setSelectedGems] = useState<GemColor[]>([]);

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

  const getCardRecommendationBadge = (tier: 1 | 2 | 3, slotIdx: number) => {
    const recIndex = recommendations.findIndex(rec => {
      const a = rec.action;
      return (a.type === 'BUY_GRID' || a.type === 'RESERVE_GRID') && a.tier === tier && a.slotIdx === slotIdx;
    });

    if (recIndex !== -1) {
      const rec = recommendations[recIndex];
      return { rank: (recIndex + 1) as 1 | 2 | 3, color: rec.badgeColor };
    }
    return undefined;
  };

  const handleToggleGemSelection = (color: GemColor) => {
    if (!isSelfTurn) return;

    setSelectedGems(prev => {
      const count = prev.filter(c => c === color).length;
      if (count === 2) {
        return prev.filter(c => c !== color);
      }
      if (count === 1) {
        if (prev.length === 1 && (gameState.bank[color] || 0) >= 4) {
          return [color, color];
        }
        return prev.filter(c => c !== color);
      }
      if (new Set(prev).size < 3) {
        return [...prev, color];
      }
      return prev;
    });
  };

  const handleConfirmTakeGems = () => {
    if (selectedGems.length === 0 || !isSelfTurn) return;

    if (selectedGems.length === 2 && selectedGems[0] === selectedGems[1]) {
      const action: GameAction = { type: 'TAKE_2_SAME', color: selectedGems[0] };
      onDispatchAction(action);
    } else {
      const action: GameAction = { type: 'TAKE_3_DISTINCT', colors: selectedGems };
      onDispatchAction(action);
    }
    setSelectedGems([]);
  };

  // Trigger Buy Confirmation Modal
  const handlePromptBuyGrid = (tier: 1 | 2 | 3, slotIdx: number, card: DevelopmentCard) => {
    if (!isSelfTurn) return;
    setPendingBuy({ source: 'grid', tier, slotIdx, card });
  };

  const handlePromptBuyReserved = (reservedIndex: number, card: DevelopmentCard) => {
    if (!isSelfTurn) return;
    setPendingBuy({ source: 'reserved', reservedIndex, card });
  };

  const handleConfirmBuy = () => {
    if (!pendingBuy) return;
    if (pendingBuy.source === 'grid' && pendingBuy.tier && pendingBuy.slotIdx !== undefined) {
      onDispatchAction({ type: 'BUY_GRID', tier: pendingBuy.tier, slotIdx: pendingBuy.slotIdx });
    } else if (pendingBuy.source === 'reserved' && pendingBuy.reservedIndex !== undefined) {
      onDispatchAction({ type: 'BUY_RESERVED', reservedIndex: pendingBuy.reservedIndex });
    }
    setPendingBuy(null);
  };

  // Trigger Reserve Confirmation Modal
  const handlePromptReserveGrid = (tier: 1 | 2 | 3, slotIdx: number, card: DevelopmentCard | null) => {
    if (!isSelfTurn || activePlayer.reservedCards.length >= 3) return;
    setPendingReserve({ type: 'grid', tier, slotIdx, card });
  };

  const handlePromptReserveDeck = (tier: 1 | 2 | 3) => {
    if (!isSelfTurn || activePlayer.reservedCards.length >= 3) return;
    setPendingReserve({ type: 'deck', tier });
  };

  const handleConfirmReserve = () => {
    if (!pendingReserve) return;
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
    <div className="game-container">
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
            onExecuteAction={(action) => onDispatchAction(action)}
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

        {/* Action Drawer Footer */}
        <div className="glass-panel action-drawer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.9rem', color: '#94A3B8' }}>Staged Gems:</span>
            {selectedGems.length === 0 ? (
              <span style={{ fontSize: '0.85rem', color: '#64748B', fontStyle: 'italic' }}>Click gems in bank to select</span>
            ) : (
              <div style={{ display: 'flex', gap: '6px' }}>
                {selectedGems.map((c, i) => (
                  <span key={i} style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid #F59E0B', color: '#F59E0B', padding: '2px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {selectedGems.length > 0 && (
              <button className="btn-secondary" onClick={() => setSelectedGems([])}>
                Clear
              </button>
            )}
            <button
              className="btn-primary"
              disabled={selectedGems.length === 0 || !isSelfTurn}
              onClick={handleConfirmTakeGems}
            >
              Confirm Take Gems
            </button>
          </div>
        </div>
      </main>

      {/* RIGHT COLUMN: Player HUD Panels */}
      <aside className="players-column">
        {gameState.players.map((player, index) => {
          const playerLogs = (gameState.moveHistory || []).filter(l => l.playerId === player.id);
          const lastActionLog = playerLogs.length > 0 ? playerLogs[playerLogs.length - 1] : null;

          return (
            <PlayerPanel
              key={player.id}
              player={player}
              isActiveTurn={index === gameState.currentTurnIndex}
              isSelf={!selfPlayerId || player.id === selfPlayerId}
              lastAction={lastActionLog ? lastActionLog.description : undefined}
              onOpenReservedModal={() => setTargetReservedPlayerId(player.id)}
              onOpenOwnedModal={() => setTargetOwnedPlayerId(player.id)}
            />
          );
        })}
      </aside>

      {/* Confirmation Modal Before Buying */}
      <BuyModal
        pendingBuy={pendingBuy}
        player={activePlayer}
        colorblindMode={colorblindMode}
        onConfirm={handleConfirmBuy}
        onCancel={() => setPendingBuy(null)}
      />

      {/* Confirmation Modal Before Reserving */}
      <ReserveModal
        pendingReserve={pendingReserve}
        goldAvailable={gameState.bank.gold > 0}
        colorblindMode={colorblindMode}
        onConfirm={handleConfirmReserve}
        onCancel={() => setPendingReserve(null)}
      />

      {/* View & Buy Reserved Cards Modal */}
      {reservedModalPlayer && (
        <ReservedCardsModal
          player={reservedModalPlayer}
          isActiveTurn={gameState.players[gameState.currentTurnIndex].id === reservedModalPlayer.id && isSelfTurn}
          colorblindMode={colorblindMode}
          onBuyReservedCard={(resIdx) => {
            const card = reservedModalPlayer.reservedCards[resIdx];
            if (card) handlePromptBuyReserved(resIdx, card);
          }}
          onClose={() => setTargetReservedPlayerId(null)}
        />
      )}

      {/* View Owned Cards Collection Modal */}
      {ownedModalPlayer && (
        <OwnedCardsModal
          player={ownedModalPlayer}
          colorblindMode={colorblindMode}
          onClose={() => setTargetOwnedPlayerId(null)}
        />
      )}

      {/* Action Modals (Discard Tokens / Select Noble) */}
      <ActionModal
        gameState={gameState}
        onConfirmDiscard={(tokens) => onDispatchAction({ type: 'DISCARD_TOKENS', tokens })}
        onSelectNoble={(nobleId) => onDispatchAction({ type: 'SELECT_NOBLE', nobleId })}
      />

      {/* Victory Summary Screen */}
      {gameState.phase === 'FINISHED' && (
        <VictoryModal gameState={gameState} onRematch={onRematch} />
      )}
    </div>
  );
};
