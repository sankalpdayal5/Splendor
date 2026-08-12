import { useState, useEffect, useCallback } from 'react';
import { GameState, GameAction, DevelopmentCard, GemColor, Player } from '../../engine/types.js';
import { getTotalGems } from '../../engine/gameEngine.js';
import { Haptics } from '../../utils/haptics.js';
import { soundManager } from '../../utils/SoundManager.js';
import { speechAnnouncer } from '../../utils/SpeechAnnouncer.js';

export type ModalState =
  | { type: 'NONE' }
  | { type: 'BUY'; card: DevelopmentCard; source: 'grid' | 'reserved'; tier?: 1 | 2 | 3; slotIdx?: number; reservedIndex?: number }
  | { type: 'RESERVE'; typeSource: 'grid' | 'deck'; tier: 1 | 2 | 3; slotIdx?: number; card?: DevelopmentCard | null }
  | { type: 'RESERVED_CARDS'; playerId: string }
  | { type: 'OWNED_CARDS'; playerId: string }
  | { type: 'PASS_AND_PLAY' };

export interface UseGameBoardStateParams {
  gameState: GameState;
  isPassAndPlay?: boolean;
  isSelfTurn: boolean;
  onDispatchAction: (action: GameAction) => void;
}

export function useGameBoardState({
  gameState,
  isPassAndPlay,
  isSelfTurn,
  onDispatchAction
}: UseGameBoardStateParams) {
  // Staged Gems & Error feedback
  const [selectedGems, setSelectedGems] = useState<GemColor[]>([]);
  const [selectionError, setSelectionError] = useState<string>('');

  // Mobile Bottom Drawer State
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);

  // Consolidated Tagged Union Modal State (Guarantees Mutual Exclusion)
  const [modalState, setModalState] = useState<ModalState>({ type: 'NONE' });

  const activePlayer = gameState.players[gameState.currentTurnIndex];

  // Auto-dismiss warning selectionError after 5 seconds
  useEffect(() => {
    if (selectionError) {
      const timer = setTimeout(() => {
        setSelectionError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [selectionError]);

  // Auto-reset staged state & open Pass & Play modal on turn changes
  useEffect(() => {
    setSelectedGems([]);
    setSelectionError('');
    if (isPassAndPlay && gameState.turnNumber > 1) {
      setModalState({ type: 'PASS_AND_PLAY' });
    } else {
      setModalState({ type: 'NONE' });
    }
    speechAnnouncer.announcePolite(`Turn ${gameState.turnNumber}: ${activePlayer.name}'s turn.`);
  }, [gameState.currentTurnIndex, gameState.turnNumber, isPassAndPlay, activePlayer.name]);

  // Memoized Helper Handlers
  const handleClearGems = useCallback(() => {
    setSelectedGems([]);
    setSelectionError('');
    Haptics.gemPick();
  }, []);

  const handleToggleGemSelection = useCallback((color: GemColor) => {
    if (!isSelfTurn) return;

    setSelectedGems(prev => {
      setSelectionError('');
      const countOfColor = prev.filter(c => c === color).length;

      // 1. If 2 of this color already selected -> clear selection of this color
      if (countOfColor === 2) {
        Haptics.gemPick();
        return prev.filter(c => c !== color);
      }

      // 2. If 1 of this color selected
      if (countOfColor === 1) {
        // If other distinct colors are already selected, tapping this selected gem deselects it
        if (prev.length > 1) {
          Haptics.gemPick();
          return prev.filter(c => c !== color);
        }

        // If only 1 gem selected, tapping it again converts to 2-same if allowed (bank count >= 4)
        if ((gameState.bank[color] || 0) < 4) {
          setSelectionError(`Bank must have at least 4 ${color.toUpperCase()} gems to take 2 same.`);
          Haptics.warning();
          return prev;
        }
        Haptics.gemPick();
        soundManager.playGemClick();
        return [color, color];
      }

      // 3. Selecting a new color for distinct gems
      if (prev.length >= 3) {
        setSelectionError('You can select at most 3 distinct gems per turn.');
        Haptics.warning();
        return prev;
      }

      // Ensure no 2-same already selected
      if (prev.length === 2 && prev[0] === prev[1]) {
        setSelectionError('Cannot add more gems when 2 same-color gems are selected.');
        Haptics.warning();
        return prev;
      }

      Haptics.gemPick();
      soundManager.playGemClick();
      return [...prev, color];
    });
  }, [isSelfTurn, gameState.bank]);

  const handleConfirmTakeGems = useCallback(() => {
    if (selectedGems.length === 0) return;

    if (selectedGems.length === 2 && selectedGems[0] === selectedGems[1]) {
      onDispatchAction({ type: 'TAKE_2_SAME', color: selectedGems[0] });
    } else {
      onDispatchAction({ type: 'TAKE_3_DISTINCT', colors: selectedGems });
    }

    setSelectedGems([]);
    setSelectionError('');
    Haptics.cardAction();
    soundManager.playGemClick();
  }, [selectedGems, onDispatchAction]);

  const closeModal = useCallback(() => {
    setModalState({ type: 'NONE' });
    Haptics.gemPick();
  }, []);

  const handlePromptBuyGrid = useCallback((tier: 1 | 2 | 3, slotIdx: number, card: DevelopmentCard) => {
    if (!isSelfTurn) return;
    setModalState({ type: 'BUY', card, source: 'grid', tier, slotIdx });
    Haptics.gemPick();
  }, [isSelfTurn]);

  const handlePromptBuyReserved = useCallback((reservedIndex: number, card: DevelopmentCard) => {
    if (!isSelfTurn) return;
    setModalState({ type: 'BUY', card, source: 'reserved', reservedIndex });
    Haptics.gemPick();
  }, [isSelfTurn]);

  const handlePromptReserveGrid = useCallback((tier: 1 | 2 | 3, slotIdx: number, card: DevelopmentCard) => {
    if (!isSelfTurn) return;
    setModalState({ type: 'RESERVE', typeSource: 'grid', tier, slotIdx, card });
    Haptics.gemPick();
  }, [isSelfTurn]);

  const handlePromptReserveDeck = useCallback((tier: 1 | 2 | 3) => {
    if (!isSelfTurn) return;
    setModalState({ type: 'RESERVE', typeSource: 'deck', tier });
    Haptics.gemPick();
  }, [isSelfTurn]);

  const handleConfirmBuy = useCallback(() => {
    if (modalState.type !== 'BUY') return;
    if (modalState.source === 'grid' && modalState.tier && modalState.slotIdx !== undefined) {
      onDispatchAction({ type: 'BUY_GRID', tier: modalState.tier, slotIdx: modalState.slotIdx });
    } else if (modalState.source === 'reserved' && modalState.reservedIndex !== undefined) {
      onDispatchAction({ type: 'BUY_RESERVED', reservedIndex: modalState.reservedIndex });
    }
    setModalState({ type: 'NONE' });
    Haptics.cardAction();
    soundManager.playCardBuy();
  }, [modalState, onDispatchAction]);

  const handleConfirmReserve = useCallback(() => {
    if (modalState.type !== 'RESERVE') return;
    if (modalState.typeSource === 'grid' && modalState.tier && modalState.slotIdx !== undefined) {
      onDispatchAction({ type: 'RESERVE_GRID', tier: modalState.tier, slotIdx: modalState.slotIdx });
    } else if (modalState.typeSource === 'deck' && modalState.tier) {
      onDispatchAction({ type: 'RESERVE_DECK', tier: modalState.tier });
    }
    setModalState({ type: 'NONE' });
    Haptics.cardAction();
    soundManager.playCardReserve();
  }, [modalState, onDispatchAction]);

  const handleOpenReservedCards = useCallback((playerId: string) => {
    setModalState({ type: 'RESERVED_CARDS', playerId });
    Haptics.gemPick();
  }, []);

  const handleOpenOwnedCards = useCallback((playerId: string) => {
    setModalState({ type: 'OWNED_CARDS', playerId });
    Haptics.gemPick();
  }, []);

  return {
    selectedGems,
    setSelectedGems,
    selectionError,
    setSelectionError,
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
  };
}
