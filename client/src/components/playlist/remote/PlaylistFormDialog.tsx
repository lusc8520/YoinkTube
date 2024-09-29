import React, {useState} from "react";
import {
    Autocomplete,
    Box,
    Button, Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Input, Switch, TextField,
    Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {TagDto} from "@yoinktube/contract";

interface PlaylistFormDialogProps {
    name: string
    link?: string
    isPublic: boolean
    forImport?: boolean
    onNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    onPublicChange: () => void
    onLinkChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
    onCancel: () => void
    onConfirm: () => void
    confirmText: string
    tags: TagDto[]
    onTagsChange: (newTags: TagDto[]) => void
    availableTags: TagDto[]
    isLoadingTags: boolean
}

export function PlaylistFormDialog({name, link, isPublic, forImport, onNameChange, onPublicChange, onLinkChange,
                                       onCancel, onConfirm, confirmText, tags, onTagsChange, availableTags, isLoadingTags}: PlaylistFormDialogProps) {

    return (
        <Box display="flex" flexDirection="column" gap="1rem">
            <TextField
                value={name}
                placeholder={forImport ? "Name... (Optional)" : "Name..."}
                onChange={onNameChange}
                autoFocus
                fullWidth
                onKeyDown={(event) => {
                    if (event.key === "Enter") {
                        onConfirm();
                    }
                }}
            />
            {forImport &&
                <TextField
                autoFocus
                margin="dense"
                label="YouTube Playlist URL"
                type="url"
                fullWidth
                value={link}
                onChange={onLinkChange}
                />
            }
            <Box sx={{display: "flex", alignItems: "center", justifyContent: "center", gap: 2, }}>
                <Box sx={{ display: "flex", alignItems: "center", width: 80, justifyContent: "flex-end",
                    opacity: isPublic ? 0 : 1, transition: "opacity 0.3s" }}>
                    <Typography variant="body2" >
                        Private
                    </Typography>
                </Box>
                <CustomSwitch checked={isPublic} onChange={onPublicChange} />
                <Box sx={{ display: "flex", alignItems: "center", width: 80, justifyContent: "flex-start",
                    opacity: isPublic ? 1 : 0, transition: "opacity 0.3s" }}>
                    <Typography variant="body2" >
                        Public
                    </Typography>
                </Box>
            </Box>
            <TagAutocomplete
                tags={tags}
                onTagsChange={onTagsChange}
                availableTags={availableTags}
                isLoadingTags={isLoadingTags}
            />
            <Box display="flex" justifyContent="center" gap="0.5rem">
                <Button
                    sx={{textTransform: "none"}}
                    variant= "acceptButton"
                    onClick={onConfirm}
                    color="success">
                    {confirmText}
                </Button>
                <Button
                    sx={{textTransform: "none"}}
                    variant= "cancelButton"
                    onClick={onCancel}
                    color="error">
                    Cancel
                </Button>
            </Box>

        </Box>
    )
}

export const TagAutocomplete = ({tags, onTagsChange, availableTags, isLoadingTags}: {
    tags: TagDto[]
    onTagsChange: (newTags: TagDto[]) => void
    availableTags: TagDto[]
    isLoadingTags: boolean
}) => {
    const [inputValue, setInputValue] = useState("")

    return (
        <Autocomplete
            multiple
            options={availableTags || []}
            getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
            value={tags}
            onChange={(_, newValue) => {
                const updatedTags = newValue.map(item =>
                    typeof item === 'string' ? { id: 0, name: item } : item
                );
                const uniqueTags = updatedTags.filter(
                    (tag, index, self) =>
                        index === self.findIndex(t => t.name === tag.name)
                );
                onTagsChange(uniqueTags);
            }}
            inputValue={inputValue}
            onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
            renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                    const { key, ...chipProps } = getTagProps({ index })
                    return (
                        <Chip key={key} label={option.name}{...chipProps}/>
                    )
                })
            }
            renderInput={(params) => (
                <TextField
                    {...params}
                    variant="outlined"
                    label="Tags"
                    placeholder="Add tags"
                />
            )}
            freeSolo
            loading={isLoadingTags}
            fullWidth
        />
    )
}


const CustomSwitch = styled(Switch)(({ theme }) => ({
    width: 62,
    height: 34,
    padding: 7,
    '& .MuiSwitch-switchBase': {
        margin: 1,
        padding: 0,
        transform: 'translateX(6px)',
        '&.Mui-checked': {
            color: '#fff',
            transform: 'translateX(22px)',
            '& .MuiSwitch-thumb:before': {
                backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
                    '#fff',
                )}" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>')`,
            },
            '& + .MuiSwitch-track': {
                opacity: 1,
                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.secondary.main : theme.palette.primary.main,
            },
        },
    },
    '& .MuiSwitch-thumb': {
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.main : theme.palette.secondary.main,
        width: 32,
        height: 32,
        '&::before': {
            content: "''",
            position: 'absolute',
            width: '100%',
            height: '100%',
            left: 0,
            top: 0,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
                '#fff',
            )}" d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>')`,
        },
    },
    '& .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.secondary.main : theme.palette.primary.main,
        borderRadius: 20 / 2,
    },
}))