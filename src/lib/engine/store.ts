import { create } from 'zustand';

interface GameState {
    currentRoomId: string | null;
    inventory: any[];
    variables: Record<string, any>;
    spriteStates: Record<string, { x: number, y: number, visible: boolean }>; // Per-instance sprite overrides
    instantiatedSprites: Record<string, any[]>; // RoomID -> list of dynamic sprites
    gameData: any;
    narrativeText: string;
    activeAction: string | null;
    primaryTargetId: string | null;

    initGame: (data: any) => void;
    setAction: (action: string | null) => void;
    processInteraction: (targetId: string) => void;
    setNarrative: (text: string) => void;
    moveToRoom: (roomId: string) => void;
    giveItem: (itemId: string) => void;
    moveSprite: (spriteId: string, x: number, y: number) => void;
    setSpriteVisibility: (spriteId: string, visible: boolean) => void;
    instantiateSprite: (templateId: string, newId: string, x: number, y: number) => void;
    getConnectedRooms: (roomId: string) => Record<string, string>;
}

export const useGameStore = create<GameState>((set, get) => ({
    currentRoomId: null,
    inventory: [],
    variables: {},
    spriteStates: {},
    instantiatedSprites: {},
    gameData: null,
    narrativeText: '',
    activeAction: null,
    primaryTargetId: null,

    initGame: (data) => {
        // Initialize sprite states from room data
        const initialSpriteStates: Record<string, any> = {};
        data.rooms?.forEach((room: any) => {
            room.sprites?.forEach((sprite: any) => {
                initialSpriteStates[(sprite.objectId || sprite.id).toUpperCase()] = {
                    x: sprite.x,
                    y: sprite.y,
                    visible: sprite.visible !== false
                };
            });
            room.hotspots?.forEach((hs: any) => {
                const id = (hs.objectId || hs.action || hs.id).toUpperCase();
                // Avoid overwriting if sprite already set it
                if (!initialSpriteStates[id]) {
                    initialSpriteStates[id] = {
                        x: hs.x,
                        y: hs.y,
                        visible: hs.visible !== false
                    };
                }
            });
        });

        set({
            gameData: data,
            currentRoomId: data.rooms?.[0]?.id || null,
            inventory: [],
            variables: {},
            spriteStates: initialSpriteStates,
            instantiatedSprites: {},
            narrativeText: 'Welcome to the adventure.',
            activeAction: null,
            primaryTargetId: null,
        });
    },

    setAction: (action) => set({ activeAction: action, primaryTargetId: null }),

    setNarrative: (text) => set({ narrativeText: text }),

    moveToRoom: (roomId) => set({ currentRoomId: roomId }),

    giveItem: (itemId) => {
        const targetUpper = itemId?.toUpperCase();
        const item = get().gameData.items.find((i: any) => i.id === itemId || i.name?.toUpperCase() === targetUpper || i.id.toUpperCase() === targetUpper);
        if (item) {
            set(state => ({ inventory: [...state.inventory, item] }));
        }
    },

    moveSprite: (spriteId, x, y) => {
        const id = spriteId.toUpperCase();
        set(state => ({
            spriteStates: {
                ...state.spriteStates,
                [id]: { ...state.spriteStates[id], x, y }
            }
        }));
    },

    setSpriteVisibility: (spriteId, visible) => {
        const id = spriteId.toUpperCase();
        set(state => ({
            spriteStates: {
                ...state.spriteStates,
                [id]: { ...state.spriteStates[id], visible }
            }
        }));
    },

    instantiateSprite: (templateId, newId, x, y) => {
        const { currentRoomId, gameData } = get();
        if (!currentRoomId || !gameData) return;

        let template = null;
        for (const room of gameData.rooms) {
            template = room.sprites.find((s: any) =>
                s.id === templateId ||
                s.objectId?.toUpperCase() === templateId?.toUpperCase()
            );
            if (template) break;
        }

        if (template) {
            const dynamicId = Date.now();
            const baseId = (template.objectId || template.id).toUpperCase();
            const newSprite = {
                ...template,
                id: `dyn_${dynamicId}`,
                objectId: newId || `${baseId}_${dynamicId}`,
                x,
                y,
                zIndex: template.zIndex || 0,
            };

            set(state => {
                const roomSprites = state.instantiatedSprites[currentRoomId] || [];
                return {
                    instantiatedSprites: {
                        ...state.instantiatedSprites,
                        [currentRoomId]: [...roomSprites, newSprite]
                    }
                };
            });
        }
    },

    processInteraction: (targetId) => {
        const { activeAction, gameData, variables, inventory } = get();
        if (!gameData) return;

        const currentRoomId = get().currentRoomId;
        const normalizedTargetId = targetId?.toUpperCase();

        let effectiveAction = activeAction?.toUpperCase();

        // Handle two-step USE interaction
        if (effectiveAction === 'USE' && !get().primaryTargetId) {
            set({ primaryTargetId: targetId });
            get().setNarrative(`USE ${targetId.toUpperCase()} with...`);
            return;
        }

        let isDefaultLook = false;

        if (!effectiveAction) {
            effectiveAction = 'LOOK';
            isDefaultLook = true;
        }

        const possibleEvents = gameData.events.filter((e: any) => {
            const eventAction = (e.action || 'LOOK').toUpperCase();
            const eventTarget = (e.targetId || 'ANY').toUpperCase();
            const eventSecondary = (e.secondaryTargetId || 'ANY').toUpperCase();

            const actionMatches = eventAction === effectiveAction;

            let targetMatches = false;
            if (effectiveAction === 'USE' && get().primaryTargetId) {
                const primary = get().primaryTargetId?.toUpperCase();
                // Check direct order: USE PRIMARY WITH SECONDARY
                targetMatches = ((eventTarget === primary || (primary?.startsWith(eventTarget + '_') ?? false))) &&
                    ((eventSecondary === normalizedTargetId || (normalizedTargetId?.startsWith(eventSecondary + '_') ?? false)));

                // Also check reverse: USE SECONDARY WITH PRIMARY (optional, but requested by some engines)
                if (!targetMatches) {
                    targetMatches = ((eventTarget === normalizedTargetId || (normalizedTargetId?.startsWith(eventTarget + '_') ?? false))) &&
                        ((eventSecondary === primary || (primary?.startsWith(eventSecondary + '_') ?? false)));
                }
            } else {
                targetMatches = eventTarget === 'ANY' ||
                    eventTarget === normalizedTargetId ||
                    (normalizedTargetId?.startsWith(eventTarget + '_') ?? false);
            }

            const roomMatches = !e.roomId || e.roomId === currentRoomId;

            return actionMatches && targetMatches && roomMatches;
        }).sort((a: any, b: any) => {
            let scoreA = a.roomId ? 100 : 0;
            let scoreB = b.roomId ? 100 : 0;
            if (a.targetId && a.targetId !== 'ANY') scoreA += 10;
            if (b.targetId && b.targetId !== 'ANY') scoreB += 10;
            if (a.secondaryTargetId && a.secondaryTargetId !== 'ANY') scoreA += 10;
            if (b.secondaryTargetId && b.secondaryTargetId !== 'ANY') scoreB += 10;
            return scoreB - scoreA;
        });

        let eventTriggered = false;

        for (const event of possibleEvents) {
            // Check conditions
            let conditionsMet = true;
            for (const cond of event.conditions) {
                const condTargetUpper = cond.targetId?.toUpperCase() || '';
                if (cond.type === 'PLAYER_HAS_ITEM') {
                    if (!inventory.some(i => i.id.toUpperCase() === condTargetUpper || i.name?.toUpperCase() === condTargetUpper)) conditionsMet = false;
                } else if (cond.type === 'PLAYER_LACKS_ITEM') {
                    if (inventory.some(i => i.id.toUpperCase() === condTargetUpper || i.name?.toUpperCase() === condTargetUpper)) conditionsMet = false;
                } else if (cond.type === 'VARIABLE_EQUALS') {
                    // Search variables case-insensitively
                    const varValue = Object.entries(variables).find(([k]) => k.toUpperCase() === condTargetUpper)?.[1];
                    if (String(varValue ?? '').toUpperCase() !== String(cond.value ?? '').toUpperCase()) conditionsMet = false;
                }
            }

            if (conditionsMet) {
                console.log(`[Interaction] Triggered event: ${event.name}`);
                // Apply Results
                for (const res of event.results) {
                    console.log(`[Interaction] Applying result: ${res.type}`, res.targetId, res.value);
                    if (res.type === 'SHOW_TEXT') {
                        get().setNarrative(res.value || '');
                    } else if (res.type === 'GIVE_ITEM') {
                        get().giveItem(res.targetId);
                    } else if (res.type === 'TAKE_ITEM') {
                        get().giveItem(res.targetId);
                        get().setSpriteVisibility(normalizedTargetId, false);
                    } else if (res.type === 'MOVE_TO_ROOM') {
                        get().moveToRoom(res.targetId);
                    } else if (res.type === 'SET_VARIABLE') {
                        set(state => ({ variables: { ...state.variables, [res.targetId]: res.value } }));
                    } else if (res.type === 'MOVE_SPRITE') {
                        const [x, y] = (res.value || '0,0').split(',').map(Number);
                        get().moveSprite(res.targetId, x, y);
                    } else if (res.type === 'SHOW_SPRITE') {
                        get().setSpriteVisibility(res.targetId, true);
                    } else if (res.type === 'HIDE_SPRITE') {
                        get().setSpriteVisibility(res.targetId, false);
                    } else if (res.type === 'INSTANTIATE_SPRITE') {
                        const [newId, xStr, yStr] = (res.value || '').split(':');
                        const x = parseInt(xStr || '0');
                        const y = parseInt(yStr || '0');
                        get().instantiateSprite(res.targetId, newId, x, y);
                    }
                }
                eventTriggered = true;
                break; // Stop evaluating after first passing event
            }
        }

        if (!eventTriggered) {
            // Fallback: Check for description on Hotspot or Sprite
            const tId = targetId.toUpperCase();
            const room = gameData.rooms.find((r: any) => r.id === currentRoomId);
            const instantiated = get().instantiatedSprites[currentRoomId || ''] || [];
            const target = room?.hotspots?.find((h: any) => h.objectId?.toUpperCase() === tId || h.id === targetId || h.action?.toUpperCase() === tId)
                || room?.sprites?.find((s: any) => s.objectId?.toUpperCase() === tId || s.id === targetId)
                || instantiated.find((s: any) => s.objectId?.toUpperCase() === tId || s.id === targetId);

            if (target?.description) {
                get().setNarrative(target.description);
                eventTriggered = true;
            }
        }

        if (!eventTriggered && !isDefaultLook && activeAction) {
            get().setNarrative(`I can't ${activeAction.toLowerCase()} that.`);
        }

        // Reset action after interaction
        set({ activeAction: null, primaryTargetId: null });
    },

    getConnectedRooms: (roomId) => {
        const { gameData } = get();
        if (!gameData || !gameData.connections) return {};

        const connections = gameData.connections.filter((c: any) => c.fromRoomId === roomId);
        const result: Record<string, string> = {};

        connections.forEach((c: any) => {
            if (c.direction) {
                result[c.direction] = c.toRoomId;
            }
        });

        return result;
    },
}));
