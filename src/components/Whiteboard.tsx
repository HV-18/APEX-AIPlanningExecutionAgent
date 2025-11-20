import { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, PencilBrush } from 'fabric';
import { Button } from '@/components/ui/button';
import { Eraser, Pencil, Square, Circle, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WhiteboardProps {
  roomId: string;
}

export default function Whiteboard({ roomId }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeColor, setActiveColor] = useState('#000000');
  const [activeTool, setActiveTool] = useState<'draw' | 'erase'>('draw');
  const { toast } = useToast();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
    });

    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.color = activeColor;
    canvas.freeDrawingBrush.width = 2;
    canvas.isDrawingMode = true;

    setFabricCanvas(canvas);

    // Listen for path creation
    canvas.on('path:created', async (e: any) => {
      const path = e.path;
      if (!path) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user?.id || '')
          .single();

        await supabase.from('whiteboard_strokes').insert({
          room_id: roomId,
          user_id: user?.id,
          user_name: profile?.full_name || 'Student',
          stroke_data: path.toJSON(),
        });
      } catch (error) {
        console.error('Error saving stroke:', error);
      }
    });

    // Subscribe to new strokes
    const channel = supabase
      .channel(`whiteboard-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'whiteboard_strokes',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload: any) => {
          const { data: { user } } = await supabase.auth.getUser();
          // Don't add our own strokes again
          if (payload.new.user_id === user?.id) return;

          try {
            const strokeData = payload.new.stroke_data;
            // For now, skip complex deserialization - just notify of new stroke
            console.log('New stroke added by another user');
          } catch (error) {
            console.error('Error rendering stroke:', error);
          }
        }
      )
      .subscribe();

    return () => {
      canvas.dispose();
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  useEffect(() => {
    if (!fabricCanvas) return;

    if (activeTool === 'draw') {
      fabricCanvas.freeDrawingBrush.color = activeColor;
      fabricCanvas.freeDrawingBrush.width = 2;
    } else if (activeTool === 'erase') {
      fabricCanvas.freeDrawingBrush.color = '#ffffff';
      fabricCanvas.freeDrawingBrush.width = 20;
    }
  }, [activeTool, activeColor, fabricCanvas]);

  const handleClear = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = '#ffffff';
    fabricCanvas.renderAll();
    toast({ title: 'Canvas cleared!' });
  };

  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={activeTool === 'draw' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTool('draw')}
        >
          <Pencil className="w-4 h-4 mr-2" />
          Draw
        </Button>
        <Button
          variant={activeTool === 'erase' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTool('erase')}
        >
          <Eraser className="w-4 h-4 mr-2" />
          Erase
        </Button>
        <div className="flex gap-1 ml-4">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => {
                setActiveColor(color);
                setActiveTool('draw');
              }}
              className={`w-8 h-8 rounded border-2 ${
                activeColor === color ? 'border-primary' : 'border-border'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <Button variant="destructive" size="sm" onClick={handleClear} className="ml-auto">
          <Trash2 className="w-4 h-4 mr-2" />
          Clear
        </Button>
      </div>
      <div className="border-2 border-border rounded-lg overflow-hidden bg-white">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}