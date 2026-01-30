import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Badge } from '../models/habit.model';
import { HttpService } from './http.service';

@Injectable({
    providedIn: 'root'
})
export class BadgeService {
    private _badges: Record<number, Badge> = {};

    constructor(private _http: HttpService) { }

    /**
     * Load badges from API
     */
    loadBadges(): Observable<Badge[]> {
        return this._http.get<Badge[]>('api/badges').pipe(
            tap((badges) => {
                this._badges = badges.reduce((acc, badge) => {
                    acc[badge.id] = badge;
                    return acc;
                }, {} as Record<number, Badge>);
            })
        );
    }

    /**
     * Get all badges
     */
    getBadges(): Badge[] {
        return Object.values(this._badges);
    }

    /**
     * Get a specific badge by ID
     * @param badgeId ID of the badge to retrieve
     */
    getBadge(badgeId: number): Badge | undefined {
        return this._badges[badgeId];
    }

    /**
     * Get badge by slug
     * @param slug Slug of the badge to retrieve
     */
    getBySlug(slug: string): Badge | undefined {
        return this.getBadges().find(b => b.slug === slug);
    }

    /**
     * Get the highest badge achieved for a given number of days
     * @param days Number of days completed
     */
    getBadgeForDays(days: number): Badge | undefined {
        const badges = this.getBadges().sort((a, b) => b.daysRequired - a.daysRequired);
        return badges.find(b => days >= b.daysRequired) || badges[badges.length - 1]; // Fallback to lowest
    }

    /**
     * Get the next badge to aim for
     * @param days Number of days completed
     */
    getNextBadge(days: number): Badge | undefined {
        const badges = this.getBadges().sort((a, b) => a.daysRequired - b.daysRequired);
        return badges.find(b => b.daysRequired > days);
    }

    /**
     * Calculate progress percentage to next badge
     * @param days Number of days completed
     */
    getProgressToNextBadge(days: number): number {
        const currentCheck = this.getBadgeForDays(days);
        const nextBadge = this.getNextBadge(days);

        if (!nextBadge || !currentCheck) return 100;

        const range = nextBadge.daysRequired - currentCheck.daysRequired;
        const progress = days - currentCheck.daysRequired;

        // Avoid division by zero
        if (range <= 0) return 100;

        return Math.round(Math.min(100, Math.max(0, (progress / range) * 100)));
    }

    /**
     * Get colors for a badge slug
     */
    getBadgeColors(slug: string): { background: string; text: string; border: string } {
        const colors: Record<string, { background: string; text: string; border: string }> = {
            'novice': { background: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' },
            'beginner': { background: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
            'intermediate': { background: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
            'advanced': { background: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
            'expert': { background: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' },
            'master': { background: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-200' }
        };
        return colors[slug] || colors['novice'];
    }
}


