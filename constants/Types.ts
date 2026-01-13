export interface Quest {
    id: string;
    address: string;
    name: string;
    description: string | null;
    quest_type: string;
    reward_token: string;
    reward_per_claim: string;
    max_claims: number;
    claims_made: number;
    expiry_timestamp: number;
    creator: string;
    is_active: boolean;
    created_at: string;
    image_url: string | null;
    is_verified_merchant: boolean;
    is_boosted: boolean;
    is_recurring: boolean;
    recurring_interval: number | null;
    nft_gate_address: string | null;
    referral_bps: number;
    proof_type: string;
    metadata: any;

    // Virtual fields for UI
    distance?: string;
    distanceVal?: number;
    rarity?: string;
}
