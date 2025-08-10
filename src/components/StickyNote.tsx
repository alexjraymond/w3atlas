import React, { useState, useRef, useEffect } from 'react';
import { Card, Textarea, ActionIcon, Box } from '@mantine/core';
import { IconX, IconGripVertical } from '@tabler/icons-react';

interface StickyNoteProps {
  id: string;
  text: string;
  onTextChange: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onPositionChange?: (id: string, x: number, y: number) => void;
}

export function StickyNote({ id, text, onTextChange, onDelete, onPositionChange }: StickyNoteProps) {
  const [isEditing, setIsEditing] = useState(text === '');
  const [localText, setLocalText] = useState(text);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);

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

  const handleDragStart = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!noteRef.current || !onPositionChange) return;
    
    const rect = noteRef.current.getBoundingClientRect();
    const parentRect = noteRef.current.offsetParent?.getBoundingClientRect();
    
    if (!parentRect) return;
    
    setDragOffset({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    });
    
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging || !noteRef.current || !onPositionChange) return;
      
      const parentRect = noteRef.current.offsetParent?.getBoundingClientRect();
      if (!parentRect) return;
      
      const newX = event.clientX - parentRect.left - dragOffset.x;
      const newY = event.clientY - parentRect.top - dragOffset.y;
      
      // Convert to percentage for responsive positioning
      const parentWidth = parentRect.width;
      const parentHeight = parentRect.height;
      
      const xPercent = (newX / parentWidth) * 100;
      const yPercent = (newY / parentHeight) * 100;
      
      onPositionChange(id, xPercent, yPercent);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, id, onPositionChange]);

  return (
    <Card
      ref={noteRef}
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
        userSelect: isDragging ? 'none' : 'auto',
      }}
      onClick={() => !isEditing && !isDragging && setIsEditing(true)}
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
            color: 'black',
            opacity: isDragging ? 1 : 0.6,
            cursor: 'grab',
            zIndex: 5
          }}
          onMouseDown={handleDragStart}
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