// Example usage of SearchBarWithSuggestions for future enhancement
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SearchBarWithSuggestions } from '@/components/ui/searchbar';
import { Theme } from '@/constants/Theme';

export default function SearchBarExample() {
    const [searchQuery, setSearchQuery] = useState('');
    
    // Example suggestions based on quest data
    const questSuggestions = [
        'Downtown Explorer',
        'Mystery NFT Drop',
        'Community Quest',
        'Central Plaza',
        'Old Lighthouse',
        'Community Center',
        'rare',
        'epic',
        'common',
        'TOKEN',
        'NFT',
        'XP'
    ];

    const handleSearch = (query: string) => {
        console.log('Searching for:', query);
        setSearchQuery(query);
    };

    const handleSuggestionPress = (suggestion: string) => {
        console.log('Selected suggestion:', suggestion);
        setSearchQuery(suggestion);
    };

    return (
        <View style={styles.container}>
            <SearchBarWithSuggestions
                placeholder="Search quests, locations, rewards..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSearch={handleSearch}
                suggestions={questSuggestions}
                onSuggestionPress={handleSuggestionPress}
                maxSuggestions={5}
                containerStyle={styles.searchContainer}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: Theme.spacing.lg,
        backgroundColor: Theme.colors.background,
    },
    searchContainer: {
        backgroundColor: Theme.colors.surface,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
});