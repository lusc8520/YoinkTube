import React, { useMemo, useCallback } from 'react';
import { Box } from '@mui/material';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { LikeDisplay } from './LikeDisplay';
import { useReactionCounts } from "../../../hooks/playlist/reaction";

interface ChartProps {
    playlistId: number;
    colors: string[];
}

export const PlaylistReactionChart: React.FC<ChartProps> = React.memo(({ playlistId, colors }) => {
    const { data: reactionCounts } = useReactionCounts(playlistId);

    const data = useMemo(() => [
        { name: 'Likes', value: reactionCounts?.likeCount || 0 },
        { name: 'Dislikes', value: reactionCounts?.dislikeCount || 0 },
    ], [reactionCounts]);

    const renderCell = useCallback((entry: any, index: number) => (
        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
    ), [colors]);

    return (
        <Box
            sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '200px',
                width: '200px',
            }}
        >
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        startAngle={90}
                        endAngle={450}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={800}
                        animationEasing="ease-out"
                    >
                        {data.map(renderCell)}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            <Box
                sx={{
                    position: 'absolute',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <LikeDisplay playlistId={playlistId} />
            </Box>
        </Box>
    );
});