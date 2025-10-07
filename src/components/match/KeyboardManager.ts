class KeyboardManager {
    private iconCache: Map<string, string> = new Map();
    private eventToIconMap: Record<string, string>;

    constructor() {
        this.eventToIconMap = this.createEventToIconMap();
    }

    private createEventToIconMap(): Record<string, string> {
        const iconFiles = [
            'aerialduel_logo_20251007104605_1.webp',
            'aerialduellost_logo_20251007104604_1.webp',
            'aerialduelwon_logo_20251007104604_1.webp',
            'assist_logo_20251002170407_1.webp',
            'backwardpass_logo_20251007104637_1.webp',
            'balllost_logo_20251007104545_1.webp',
            'ballrecovered_logo_20251007104545_1.webp',
            'ballrecovery_logo_20251007104545_1.webp',
            'block_logo_20251002170328_1.webp',
            'clearance_logo_20251002170328_1.webp',
            'contact_logo_20251007104654_1.webp',
            'corner_logo_20251002170330_1.webp',
            'cross_logo_20251002170310_1.webp',
            'decisivepass_logo_20251007104638_1.webp',
            'dribble_logo_20251002170309_1.webp',
            'dribbleattempt_logo_20251007104617_1.webp',
            'forwardpass_logo_20251007104637_1.webp',
            'foul_logo_20251002170348_1.webp',
            'freekick_logo_20251002170349_1.webp',
            'goal_logo_20251002170408_1.webp',
            'goalkick_logo_20251002170348_1.webp',
            'groundduel_logo_20251007104604_1.webp',
            'interception_logo_20251002170328_1.webp',
            'lateralpass_logo_20251007104637_1.webp',
            'longpass_logo_20251007104639_1.webp',
            'offensivepass_logo_20251007104617_1.webp',
            'offside_logo_20251002170407_1.webp',
            'owngoal_logo_20251007104545_1.webp',
            'pass_logo_20251002170310_1.webp',
            'penalty_logo_20251002170349_1.webp',
            'possession_logo_20251007104546_1.webp',
            'posthit_logo_20251007104654_1.webp',
            'pressure_logo_20251007104618_1.webp',
            'redcard_logo_20251002170407_1.webp',
            'save_logo_20251002170328_1.webp',
            'shot_logo_20251002170309_1.webp',
            'sixmeterviolation_logo_20251007104653_1.webp',
            'substitution_logo_20251007104605_1.webp',
            'successfulcross_logo_20251007104655_1.webp',
            'successfuldribble_logo_20251007104618_1.webp',
            'supportpass_logo_20251007104617_1.webp',
            'tackle_logo_20251002170310_1.webp',
            'throwin_logo_20251002170348_1.webp',
            'yellowcard_logo_20251002170407_1.webp'
        ];

        const map: Record<string, string> = {};
        iconFiles.forEach(file => {
            const eventType = this.extractEventTypeFromFilename(file);
            if (eventType) {
                map[eventType] = `/icones/${file}`;
            }
        });

        return map;
    }

    private extractEventTypeFromFilename(filename: string): string | null {
        const match = filename.match(/^(.*?)(_logo_)/);
        return match ? match[1] : null;
    }

    public getIconForEvent(eventType: string): string | null {
        const S = eventType.toLowerCase().replace(/[\s_]/g, '');
        if (this.iconCache.has(S)) {
            return this.iconCache.get(S)!;
        }

        const foundIcon = this.eventToIconMap[S] || null;
        if (foundIcon) {
            this.iconCache.set(S, foundIcon);
        }

        return foundIcon;
    }
}

const keyboardManager = new KeyboardManager();
export default keyboardManager;