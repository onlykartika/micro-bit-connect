import { useState, useCallback, useRef } from "react";

interface UseSerialReturn {
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  lastMessage: string;
  log: string[];
}

export const useSerial = (onData: (data: string) => void): UseSerialReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const portRef = useRef<SerialPort | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);

  const addLog = (msg: string) => {
    setLog((prev) => [...prev.slice(-49), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const readLoop = useCallback(
    async (port: SerialPort) => {
      const decoder = new TextDecoderStream();
      const readable = port.readable;
      if (!readable) return;

      const pipedStream = readable.pipeThrough(decoder);
      const reader = pipedStream.getReader();
      readerRef.current = reader;

      let buffer = "";

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) {
            buffer += value;
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";
            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed) {
                setLastMessage(trimmed);
                addLog(`Received: ${trimmed}`);
                onData(trimmed);
              }
            }
          }
        }
      } catch (err) {
        addLog(`Read error: ${err}`);
      } finally {
        reader.releaseLock();
      }
    },
    [onData]
  );

  const connect = useCallback(async () => {
    try {
      const port = await navigator.serial.requestPort({
        filters: [{ usbVendorId: 0x0d28 }], // micro:bit vendor ID
      });
      await port.open({ baudRate: 115200 });
      portRef.current = port;
      setIsConnected(true);
      addLog("Connected to micro:bit");
      readLoop(port);
    } catch (err) {
      addLog(`Connection failed: ${err}`);
    }
  }, [readLoop]);

  const disconnect = useCallback(async () => {
    try {
      readerRef.current?.cancel();
      await portRef.current?.close();
      portRef.current = null;
      setIsConnected(false);
      addLog("Disconnected");
    } catch (err) {
      addLog(`Disconnect error: ${err}`);
    }
  }, []);

  return { isConnected, connect, disconnect, lastMessage, log };
};
