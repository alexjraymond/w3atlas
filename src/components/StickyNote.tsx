import React, { useState, useRef, useEffect } from 'react';
import { Card, Textarea, ActionIcon, Box } from '@mantine/core';
import { IconX, IconGripVertical } from '@tabler/icons-react';

interface StickyNoteProps {
  id: string;
  text: string;
  onTextChange: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}

export function StickyNote({ id, text, onTextChange, onDelete }: StickyNoteProps) {
  const [isEditing, setIsEditing] = useState(text === '');
  const [localText, setLocalText] = useState(text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    onTextChange(id, localText);
    setIsEditing(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      handleSave();
    } else if (event.key === 'Escape') {
      setLocalText(text);
      setIsEditing(false);
    }
  };

  return (
    <Card
      shadow="md"
      padding="xs"
      radius="md"
      style={{
        backgroundColor: '#FFF59D',
        border: '1px solid #F57F17',
        minWidth: '120px',
        maxWidth: '200px',
        position: 'relative',
        cursor: isEditing ? 'default' : 'pointer',
      }}
      onClick={() => !isEditing && setIsEditing(true)}
    >
      <Box style={{ position: 'relative' }}>
        <ActionIcon
          size="xs"
          variant="subtle"
          color="gray"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
          style={{
            position: 'absolute',
            top: -8,
            right: -8,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderRadius: '50%',
            zIndex: 10,
          }}
        >
          <IconX size={12} />
        </ActionIcon>
        
        <IconGripVertical 
          size={12} 
          style={{ 
            position: 'absolute', 
            top: -2, 
            left: -2, 
            color: '#black',
            opacity: 0.6 
          }} 
        />

        {isEditing ? (
          <Textarea
            ref={textareaRef}
            value={localText}
            color="black"
            onChange={(e) => setLocalText(e.currentTarget.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            placeholder="Type your note here..."
            autosize
            minRows={2}
            maxRows={6}
            size="xs"
            styles={{
              input: {
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '12px',
                padding: '4px',
                resize: 'none',
              },
            }}
          />
        ) : (
          <Box
            style={{
              fontSize: '12px',
              color: 'black',
              padding: '4px',
              minHeight: '32px',
              wordWrap: 'break-word',
              whiteSpace: 'pre-wrap',
            }}
          >
            {text || 'Click to edit...'}
          </Box>
        )}
      </Box>
    </Card>
  );
}