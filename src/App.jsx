import React, { useState, useRef, useEffect } from 'react';
import { Terminal, ShieldAlert, Wifi, Globe, HelpCircle, Trash2, RefreshCw } from 'lucide-react';

function App() {
  const [history, setHistory] = useState([
    { text: '==================================================', type: 'system' },
    { text: '   স্বাগতম! বাংলা ওয়েব টার্মিনাল ও পিং টুলে (v1.0.0)', type: 'welcome' },
    { text: '==================================================', type: 'system' },
    { text: 'যেকোনো IP বা URL পিং করতে টাইপ করুন: ping <url/ip>', type: 'help' },
    { text: 'অন্যান্য সব কমান্ড ও সাহায্য দেখতে টাইপ করুন: help', type: 'help' },
    { text: ' ', type: 'blank' }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [commandHistory, setCommandHistory] = useState([]);
  const terminalEndRef = useRef(null);
  const inputRef = useRef(null);
  const commandHistoryIndexRef = useRef(-1);

  const commandSuggestions = [
    'help', 'ping', 'clear', 'info', 'sysinfo', 'ipconfig', 'network', 'speed', 'speedtest',
    'tracert', 'nslookup', 'netstat', 'arp', 'uptime', 'pwd', 'mkdir', 'cd', 'cat', 'rm',
    'route', 'ifconfig', 'echo', 'date', 'time', 'whoami', 'hostname', 'ls'
  ];

  const [terminalSettings, setTerminalSettings] = useState({
    theme: 'midnight',
    fontSize: 12,
    showHeader: true,
    cursorBlink: true,
    compactMode: false,
    opacity: 100,
    lineSpacing: 1.5
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [terminalTabs, setTerminalTabs] = useState([
    { id: 'console', label: 'Console', theme: 'midnight' },
    { id: 'network', label: 'Network', theme: 'forest' },
    { id: 'system', label: 'System', theme: 'sunset' }
  ]);
  const [activeTabId, setActiveTabId] = useState('console');
  const [terminalHeight, setTerminalHeight] = useState(82);
  const [isResizing, setIsResizing] = useState(false);
  const terminalPanelRef = useRef(null);

  const createNewTab = () => {
    const nextIndex = terminalTabs.length + 1;
    const nextTab = {
      id: `terminal-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      label: `Terminal ${nextIndex}`,
      theme: 'neon'
    };

    setTerminalTabs(prev => [...prev, nextTab]);
    setActiveTabId(nextTab.id);
  };

  const removeTab = (tabId) => {
    setTerminalTabs(prev => {
      if (prev.length === 1) return prev;

      const nextTabs = prev.filter(tab => tab.id !== tabId);
      const removedIndex = prev.findIndex(tab => tab.id === tabId);
      const fallbackTabId = nextTabs[Math.max(0, removedIndex - 1)]?.id || nextTabs[0]?.id;
      setActiveTabId(fallbackTabId);
      return nextTabs;
    });
  };

  const terminalThemes = {
    midnight: {
      shell: 'bg-[#070b12] text-gray-200',
      panel: 'bg-[#0d1527] border-gray-800',
      header: 'bg-[#141f36] border-gray-800',
      inputRow: 'bg-[#0a0f1d] border-gray-800',
      muted: 'text-gray-500',
      prompt: 'text-sky-400',
      inputText: 'text-emerald-400',
      accent: 'bg-[#0a0f1d] border border-gray-800/50'
    },
    forest: {
      shell: 'bg-[#07150f] text-emerald-50',
      panel: 'bg-[#0b1f1a] border-emerald-900/70',
      header: 'bg-[#112d27] border-emerald-900/70',
      inputRow: 'bg-[#091b17] border-emerald-900/70',
      muted: 'text-emerald-200/70',
      prompt: 'text-emerald-300',
      inputText: 'text-lime-300',
      accent: 'bg-[#0a1d19] border border-emerald-800/60'
    },
    sunset: {
      shell: 'bg-[#1a0f0d] text-orange-50',
      panel: 'bg-[#2a1714] border-orange-900/70',
      header: 'bg-[#3c1d18] border-orange-900/70',
      inputRow: 'bg-[#1f120f] border-orange-900/70',
      muted: 'text-orange-200/70',
      prompt: 'text-orange-300',
      inputText: 'text-amber-300',
      accent: 'bg-[#241512] border border-orange-800/60'
    },
    neon: {
      shell: 'bg-[#090b13] text-cyan-50',
      panel: 'bg-[#111827] border-cyan-800/70',
      header: 'bg-[#182235] border-cyan-800/70',
      inputRow: 'bg-[#0d1320] border-cyan-800/70',
      muted: 'text-cyan-200/70',
      prompt: 'text-cyan-300',
      inputText: 'text-fuchsia-300',
      accent: 'bg-[#0d1320] border border-cyan-800/60'
    }
  };

  const activeTab = terminalTabs.find((tab) => tab.id === activeTabId) || terminalTabs[0];
  const theme = terminalThemes[activeTab?.theme || terminalSettings.theme];

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!isResizing) return;
      const nextHeight = Math.min(Math.max(((window.innerHeight - event.clientY) / window.innerHeight) * 100, 35), 88);
      setTerminalHeight(nextHeight);
    };

    const handleMouseUp = () => setIsResizing(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const focusInput = () => {
    if (!inputRef.current) return;
    inputRef.current.focus();
    const length = inputRef.current.value.length;
    inputRef.current.setSelectionRange(length, length);
  };

  useEffect(() => {
    focusInput();
  }, []);

  useEffect(() => {
    if (!isProcessing) {
      focusInput();
    }
  }, [history, isProcessing]);

  const validateInput = (target) => {
    // Simple regex for domain or IP validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    
    // Remove protocols for validation check
    let cleanTarget = target.replace(/^(https?:\/\/)?(www\.)?/, '');
    // Split port if any
    cleanTarget = cleanTarget.split(':')[0].split('/')[0];

    return ipRegex.test(cleanTarget) || domainRegex.test(cleanTarget);
  };

  const executeCommand = async (fullCommand) => {
    const trimmed = fullCommand.trim();
    if (!trimmed) return;

    const newHistory = [...history, { text: `user@bangla-terminal:~# ${trimmed}`, type: 'user' }];
    const parts = trimmed.split(/\s+/);
    const command = parts[0].toLowerCase();
    const arg = parts[1];
    const rest = parts.slice(1).join(' ');

    setIsProcessing(true);
    setHistory(newHistory);
    setInput('');
    commandHistoryIndexRef.current = -1;

    // Simulate small latency for network feel
    await new Promise((resolve) => setTimeout(resolve, 600));

    switch (command) {
      case 'help':
        setHistory(prev => [
          ...prev,
          { text: '--- উপলব্ধ কমান্ডের তালিকা (Available Commands) ---', type: 'system' },
          { text: '  ping <ip/url>   - নির্দিষ্ট সার্ভার বা ডোমেইন পিং করার জন্য।', type: 'text' },
          { text: '  ipconfig        - নেটওয়ার্ক ও IP ডিটেইলস দেখায়।', type: 'text' },
          { text: '  network         - ইন্টারফেস ও কানেকশন ডিটেইলস দেখায়।', type: 'text' },
          { text: '  speed           - নেটওয়ার্ক স্পিড/থ্রুপুট দেখায়।', type: 'text' },
          { text: '  tracert         - রাউট/হপ ডিটেইলস দেখায়।', type: 'text' },
          { text: '  nslookup        - DNS তথ্য দেখায়।', type: 'text' },
          { text: '  netstat         - সক্রিয় কানেকশন দেখায়।', type: 'text' },
          { text: '  arp             - ARP টেবিল দেখায়।', type: 'text' },
          { text: '  uptime          - সিস্টেম আপটাইম দেখায়।', type: 'text' },
          { text: '  pwd             - বর্তমান ডিরেক্টরি দেখায়।', type: 'text' },
          { text: '  mkdir <name>    - নতুন ডিরেক্টরি তৈরি করে।', type: 'text' },
          { text: '  cd <dir>        - ডিরেক্টরি পরিবর্তন করে।', type: 'text' },
          { text: '  cat <file>      - ফাইল কনটেন্ট দেখায়।', type: 'text' },
          { text: '  rm <file>       - ফাইল মুছে ফেলতে পারে।', type: 'text' },
          { text: '  route           - রাউট টেবিল দেখায়।', type: 'text' },
          { text: '  ifconfig        - নেটওয়ার্ক interface ডিটেইলস দেখায়।', type: 'text' },
          { text: '  echo <text>     - যেকোনো টেক্সট কনসোলে প্রদর্শন করে।', type: 'text' },
          { text: '  date            - বর্তমান তারিখ দেখায়।', type: 'text' },
          { text: '  time            - বর্তমান সময় দেখায়।', type: 'text' },
          { text: '  whoami          - বর্তমান ব্যবহারকারীর নাম দেখায়।', type: 'text' },
          { text: '  hostname        - হোস্টনেম দেখায়।', type: 'text' },
          { text: '  ls              - সিমুলেটেড ফাইল/ফোল্ডার তালিকা দেখায়।', type: 'text' },
          { text: '  clear           - টার্মিনাল স্ক্রিন পরিষ্কার করার জন্য।', type: 'text' },
          { text: '  info            - এই প্রজেক্ট সম্পর্কে জানার জন্য।', type: 'text' },
          { text: '  sysinfo         - টার্মিনাল এনভায়রনমেন্ট দেখতে।', type: 'text' },
          { text: '------------------------------------------------', type: 'system' }
        ]);
        break;

      case 'clear':
        setHistory([]);
        break;

      case 'date':
        setHistory(prev => [
          ...prev,
          { text: `বর্তমান তারিখ: ${new Date().toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, type: 'text' }
        ]);
        break;

      case 'time':
        setHistory(prev => [
          ...prev,
          { text: `বর্তমান সময়: ${new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`, type: 'text' }
        ]);
        break;

      case 'whoami':
        setHistory(prev => [
          ...prev,
          { text: 'ব্যবহারকারী: root', type: 'text' }
        ]);
        break;

      case 'hostname':
        setHistory(prev => [
          ...prev,
          { text: 'হোস্টনেম: bangla-terminal', type: 'text' }
        ]);
        break;

      case 'ls':
        setHistory(prev => [
          ...prev,
          { text: 'drwxr-xr-x  4 root  root  4096 Jun  01  2026 .', type: 'text' },
          { text: 'drwxr-xr-x  4 root  root  4096 Jun  01  2026 ..', type: 'text' },
          { text: '-rw-r--r--  1 root  root   2048 Jun  01  2026 app.js', type: 'text' },
          { text: '-rw-r--r--  1 root  root   4096 Jun  01  2026 config.json', type: 'text' },
          { text: 'drwxr-xr-x  2 root  root   4096 Jun  01  2026 logs', type: 'text' },
          { text: 'drwxr-xr-x  2 root  root   4096 Jun  01  2026 network', type: 'text' }
        ]);
        break;

      case 'echo':
        setHistory(prev => [
          ...prev,
          { text: rest ? rest : 'শুনুন, এটি একটি খালি echo কমান্ড।', type: 'text' }
        ]);
        break;

      case 'ipconfig':
        setHistory(prev => [
          ...prev,
          { text: 'Windows IP Configuration', type: 'system' },
          { text: '   Host Name . . . . . . . . . . . : bangla-terminal', type: 'text' },
          { text: '   Primary Dns Suffix  . . . . . . : localdomain', type: 'text' },
          { text: '   DNS Servers . . . . . . . . . . : 8.8.8.8', type: 'text' },
          { text: '                                      1.1.1.1', type: 'text' },
          { text: '   IPv4 Address. . . . . . . . . . : 192.168.0.24', type: 'text' },
          { text: '   Subnet Mask . . . . . . . . . . : 255.255.255.0', type: 'text' },
          { text: '   Default Gateway . . . . . . . . : 192.168.0.1', type: 'text' },
          { text: '   MAC Address . . . . . . . . . . : 7C-3A-64-88-7E-42', type: 'text' }
        ]);
        break;

      case 'network':
        setHistory(prev => [
          ...prev,
          { text: '--- Network Details ---', type: 'system' },
          { text: 'Interface     : Wi-Fi', type: 'text' },
          { text: 'Status        : Online', type: 'success' },
          { text: 'Connection    : Bangla Local Network', type: 'text' },
          { text: 'IPv4          : 192.168.0.24', type: 'text' },
          { text: 'Gateway       : 192.168.0.1', type: 'text' },
          { text: 'Subnet Mask   : 255.255.255.0', type: 'text' },
          { text: 'DNS           : 8.8.8.8 / 1.1.1.1', type: 'text' },
          { text: 'Signal        : Strong (82%)', type: 'success' },
          { text: 'Latency       : 18ms average', type: 'text' }
        ]);
        break;

      case 'speed':
      case 'speedtest':
        setHistory(prev => [
          ...prev,
          { text: '--- Network Speed Test ---', type: 'system' },
          { text: 'Testing download speed...', type: 'text' },
          { text: 'Download: 156.4 Mbps', type: 'success' },
          { text: 'Upload:   92.7 Mbps', type: 'success' },
          { text: 'Ping:     18 ms', type: 'success' },
          { text: 'Connection: Stable / Good quality', type: 'text' }
        ]);
        break;

      case 'tracert':
        setHistory(prev => [
          ...prev,
          { text: 'Tracing route to google.com [30 hops max]', type: 'system' },
          { text: '1    192.168.0.1   1 ms   1 ms   1 ms', type: 'text' },
          { text: '2    10.10.12.1    3 ms   2 ms   3 ms', type: 'text' },
          { text: '3    172.16.0.1    8 ms   7 ms   9 ms', type: 'text' },
          { text: '4    103.86.96.12  15 ms  14 ms  16 ms', type: 'text' },
          { text: '5    142.250.195.14 18 ms  18 ms  20 ms', type: 'success' },
          { text: 'Trace complete.', type: 'success' }
        ]);
        break;

      case 'nslookup':
        setHistory(prev => [
          ...prev,
          { text: `Server:  dns.google`, type: 'system' },
          { text: `Address: 8.8.8.8`, type: 'text' },
          { text: `Name:    google.com`, type: 'text' },
          { text: `Address: 142.250.190.78`, type: 'success' }
        ]);
        break;

      case 'netstat':
        setHistory(prev => [
          ...prev,
          { text: 'Active Connections', type: 'system' },
          { text: 'Proto  Local Address          Foreign Address        State', type: 'text' },
          { text: 'TCP    192.168.0.24:53792    142.250.190.78:443     ESTABLISHED', type: 'success' },
          { text: 'TCP    192.168.0.24:54811    1.1.1.1:53            ESTABLISHED', type: 'text' },
          { text: 'UDP    192.168.0.24:5353     *:*                    LISTENING', type: 'text' }
        ]);
        break;

      case 'arp':
        setHistory(prev => [
          ...prev,
          { text: 'Interface: Wi-Fi', type: 'system' },
          { text: 'Internet Address      Physical Address      Type', type: 'text' },
          { text: '192.168.0.1           88-8a-5b-2c-0d-f1    dynamic', type: 'success' },
          { text: '192.168.0.24          7c-3a-64-88-7e-42    dynamic', type: 'success' }
        ]);
        break;

      case 'uptime':
        setHistory(prev => [
          ...prev,
          { text: 'System uptime: 2 days, 5 hours, 14 minutes', type: 'text' }
        ]);
        break;

      case 'pwd':
        setHistory(prev => [
          ...prev,
          { text: '/home/bangla-terminal', type: 'text' }
        ]);
        break;

      case 'mkdir':
        setHistory(prev => [
          ...prev,
          { text: `ডিরেক্টরি তৈরি হয়েছে: ${arg || 'new-folder'}`, type: 'success' }
        ]);
        break;

      case 'cd':
        setHistory(prev => [
          ...prev,
          { text: `ডিরেক্টরি পরিবর্তন: ${arg || '/home/bangla-terminal'}`, type: 'text' }
        ]);
        break;

      case 'cat':
        setHistory(prev => [
          ...prev,
          { text: `ফাইল কনটেন্ট (${arg || 'sample.txt'}):`, type: 'system' },
          { text: 'বাংলা টার্মিনাল sample output', type: 'text' },
          { text: 'সফলভাবে লোড হয়েছে।', type: 'success' }
        ]);
        break;

      case 'rm':
        setHistory(prev => [
          ...prev,
          { text: `ফাইল মুছে ফেলা হয়েছে: ${arg || 'sample.txt'}`, type: 'success' }
        ]);
        break;

      case 'route':
        setHistory(prev => [
          ...prev,
          { text: 'Kernel IP routing table', type: 'system' },
          { text: 'Destination     Gateway         Genmask         Flags Metric Ref    Use Iface', type: 'text' },
          { text: '0.0.0.0         192.168.0.1    0.0.0.0         UG    100    0        0 eth0', type: 'success' },
          { text: '192.168.0.0     0.0.0.0        255.255.255.0   U     100    0        0 eth0', type: 'text' }
        ]);
        break;

      case 'ifconfig':
        setHistory(prev => [
          ...prev,
          { text: 'eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500', type: 'system' },
          { text: 'inet 192.168.0.24  netmask 255.255.255.0  broadcast 192.168.0.255', type: 'text' },
          { text: 'inet6 fe80::7c3a:64ff:fe88:7e42  prefixlen 64  scopeid 0x20<link>', type: 'text' },
          { text: 'ether 7c:3a:64:88:7e:42  txqueuelen 1000  (Ethernet)', type: 'success' }
        ]);
        break;

      case 'info':
        setHistory(prev => [
          ...prev,
          { text: '[প্রজেক্ট তথ্য]', type: 'system' },
          { text: 'এটি একটি রিয়াক্ট-ভিত্তিক কাস্টম ওয়েব টার্মিনাল। এটি ইনপুট ইংরেজিতে নিলেও সম্পূর্ণ রেসপন্স বাংলায় প্রদান করে। নেটওয়ার্ক ট্রাবলশুটিং ফিল দেওয়ার জন্য এতে পিং ডেমো ইন্টিগ্রেট করা হয়েছে।', type: 'text' }
        ]);
        break;

      case 'sysinfo':
        setHistory(prev => [
          ...prev,
          { text: `ওএস (OS): Bangla Virtual Core Engine v1.0`, type: 'text' },
          { text: `কানেকশন স্ট্যাটাস: অনলাইন (সিমুলেটেড)`, type: 'text' },
          { text: `সময়: ${new Date().toLocaleString('bn-BD')}`, type: 'text' }
        ]);
        break;

      case 'ping':
        if (!arg) {
          setHistory(prev => [
            ...prev,
            { text: 'ভুল ব্যবহার! অনুগ্রহ করে সঠিক ফরম্যাট ব্যবহার করুন। যেমন: ping google.com অথবা ping 8.8.8.8', type: 'error' }
          ]);
        } else {
          const isValid = validateInput(arg);
          if (!isValid) {
            setHistory(prev => [
              ...prev,
              { text: `[ত্রুটি] "${arg}" একটি বৈধ IP অ্যাড্রেস বা ডোমেইন URL নয়!`, type: 'error' },
              { text: `অনুগ্রহ করে স্পেলিং বা ফরম্যাট চেক করুন (উদা: 192.168.1.1 অথবা facebook.com)।`, type: 'error' }
            ]);
          } else {
            // Clean host for display
            const cleanHost = arg.replace(/^(https?:\/\/)?(www\.)?/, '');
            
            setHistory(prev => [
              ...prev,
              { text: `পিং করা হচ্ছে: ${cleanHost} [৩২ বাইট ডাটা সহ]...`, type: 'system' }
            ]);

            // Simulate ping sequences
            for (let i = 1; i <= 4; i++) {
              await new Promise((resolve) => setTimeout(resolve, 400));
              const time = Math.floor(Math.random() * 45) + 12;
              const ttl = Math.floor(Math.random() * 8) + 50;
              
              setHistory(prev => [
                ...prev,
                { text: `উত্তর এসেছে ${cleanHost} থেকে: বাইট=৩২ সময়=${time}ms TTL=${ttl}`, type: 'ping-success' }
              ]);
            }

            // Ping Summary
            await new Promise((resolve) => setTimeout(resolve, 200));
            setHistory(prev => [
              ...prev,
              { text: ` `, type: 'blank' },
              { text: `--- ${cleanHost} পিং পরিসংখ্যান ---`, type: 'system' },
              { text: `    প্যাকেট: প্রেরিত = ৪, প্রাপ্ত = ৪, হারানো = ০ (০% ক্ষতি)`, type: 'text' },
              { text: `আনুমানিক রাউন্ড ট্রিপ সময় (মিলিসেকেন্ডে):`, type: 'text' },
              { text: `    সর্বনিম্ন = ১২ms, সর্বোচ্চ = ৫৭ms, গড় = ২৪ms`, type: 'success' },
              { text: `স্ট্যাটাস: হোস্টটি সম্পূর্ণ সচল এবং সাকসেসফুলি রেসপন্স করছে।`, type: 'success' }
            ]);
          }
        }
        break;

      default:
        setHistory(prev => [
          ...prev,
          { text: `কমান্ড পাওয়া যায়নি: "${command}"। উপলব্ধ কমান্ডগুলো দেখতে "help" টাইপ করুন।`, type: 'error' }
        ]);
    }

    setCommandHistory(prev => {
      if (!trimmed) return prev;
      const lastCommand = prev[prev.length - 1];
      return lastCommand === trimmed ? prev : [...prev, trimmed];
    });
    setIsProcessing(false);
    setTimeout(() => focusInput(), 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      executeCommand(input);
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      if (!input.trim()) return;

      const typedValue = input.trim().toLowerCase();
      const match = commandSuggestions.find((cmd) => cmd.startsWith(typedValue));
      if (match) {
        setInput(match);
      }
      return;
    }

    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      if (commandHistory.length === 0) return;
      e.preventDefault();

      if (e.key === 'ArrowUp') {
        if (commandHistoryIndexRef.current === -1) {
          commandHistoryIndexRef.current = 0;
        } else {
          commandHistoryIndexRef.current = Math.min(commandHistoryIndexRef.current + 1, commandHistory.length - 1);
        }
      } else {
        if (commandHistoryIndexRef.current <= 0) {
          commandHistoryIndexRef.current = -1;
          setInput('');
          return;
        }
        commandHistoryIndexRef.current -= 1;
      }

      const selectedCommand = commandHistoryIndexRef.current === -1
        ? ''
        : commandHistory[commandHistory.length - 1 - commandHistoryIndexRef.current];

      setInput(selectedCommand || '');
    }
  };

  const getLineColor = (type) => {
    switch (type) {
      case 'user': return 'text-sky-400 font-bold';
      case 'error': return 'text-rose-400 font-medium';
      case 'success': return 'text-emerald-400 font-medium';
      case 'ping-success': return 'text-green-400 opacity-90';
      case 'system': return 'text-amber-400';
      case 'welcome': return 'text-yellow-300 font-bold';
      case 'help': return 'text-gray-400 italic';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className={`min-h-screen p-4 md:p-8 flex flex-col justify-between items-center ${theme.shell}`} onClick={focusInput}>
      <div
        ref={terminalPanelRef}
        className={`w-full max-w-5xl ${theme.panel} rounded-xl border shadow-2xl flex flex-col overflow-hidden`}
        style={{ opacity: terminalSettings.opacity / 100, height: `${terminalHeight}vh` }}
      >
        
        {/* Terminal Header */}
        {terminalSettings.showHeader && (
          <div className={`${theme.header} px-4 py-2 border-b flex items-center justify-between select-none relative`}>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className={`text-xs ${theme.muted} font-mono pl-2 flex items-center gap-1.5`}>
                <Terminal className={`w-3.5 h-3.5 ${theme.prompt}`} /> bangla-interactive-terminal.sh
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded border border-gray-700 bg-[#09111d]/80 p-1 text-[10px] font-mono text-gray-300">
                {terminalTabs.map((tab) => (
                  <div key={tab.id} className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setActiveTabId(tab.id); }}
                      className={`px-2 py-1 rounded transition-colors ${activeTabId === tab.id ? 'bg-sky-500 text-slate-950' : 'text-gray-300 hover:bg-gray-800'}`}
                    >
                      {tab.label}
                    </button>
                    {terminalTabs.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeTab(tab.id); }}
                        className="text-[10px] text-gray-400 hover:text-rose-400"
                        aria-label={`Delete ${tab.label}`}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); createNewTab(); }}
                  className="px-2 py-1 rounded border border-dashed border-sky-500/60 text-sky-300 hover:bg-sky-500/10"
                  title="Add terminal tab"
                >
                  +
                </button>
              </div>

              <span className={`hidden sm:inline ${theme.accent} px-2 py-0.5 rounded text-[10px] ${theme.muted} font-mono`}>ENG → BN</span>

              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setIsSettingsOpen(prev => !prev); }}
                  className="px-2 py-1 rounded border border-gray-700 bg-[#0a0f1d]/80 hover:bg-gray-800 transition-colors"
                  title="Terminal settings"
                >
                  ⚙
                </button>

                {isSettingsOpen && (
                  <div className="absolute right-0 top-full mt-2 z-10 w-[320px] rounded border border-gray-700 bg-[#0a0f1d]/95 p-2 shadow-xl backdrop-blur-sm">
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <label className="flex items-center justify-between gap-2">
                        <span>Theme</span>
                        <select
                          value={activeTab?.theme || terminalSettings.theme}
                          onChange={(e) => {
                            const nextTheme = e.target.value;
                            setTerminalSettings(prev => ({ ...prev, theme: nextTheme }));
                            setTerminalTabs(prevTabs => prevTabs.map((tab) => tab.id === activeTabId ? { ...tab, theme: nextTheme } : tab));
                          }}
                          className="w-20 rounded border border-gray-700 bg-[#111827] px-1 py-0.5 text-[11px] outline-none"
                        >
                          <option value="midnight">Mid</option>
                          <option value="forest">Forest</option>
                          <option value="sunset">Sunset</option>
                          <option value="neon">Neon</option>
                        </select>
                      </label>

                      <label className="flex items-center justify-between gap-2">
                        <span>Font</span>
                        <span>{terminalSettings.fontSize}px</span>
                      </label>

                      <div className="col-span-2">
                        <input
                          type="range"
                          min="12"
                          max="20"
                          step="1"
                          value={terminalSettings.fontSize}
                          onChange={(e) => setTerminalSettings(prev => ({ ...prev, fontSize: Number(e.target.value) }))}
                          className="w-full accent-sky-400"
                        />
                      </div>

                      <label className="flex items-center justify-between gap-2">
                        <span>Opacity</span>
                        <span>{terminalSettings.opacity}%</span>
                      </label>

                      <label className="flex items-center justify-between gap-2">
                        <span>Line</span>
                        <span>{terminalSettings.lineSpacing.toFixed(1)}</span>
                      </label>

                      <div className="col-span-2">
                        <input
                          type="range"
                          min="70"
                          max="100"
                          step="5"
                          value={terminalSettings.opacity}
                          onChange={(e) => setTerminalSettings(prev => ({ ...prev, opacity: Number(e.target.value) }))}
                          className="w-full accent-violet-400"
                        />
                      </div>

                      <div className="col-span-2">
                        <input
                          type="range"
                          min="1"
                          max="2"
                          step="0.1"
                          value={terminalSettings.lineSpacing}
                          onChange={(e) => setTerminalSettings(prev => ({ ...prev, lineSpacing: Number(e.target.value) }))}
                          className="w-full accent-amber-400"
                        />
                      </div>

                      <label className="flex items-center gap-2 text-[11px]">
                        <input
                          type="checkbox"
                          checked={terminalSettings.compactMode}
                          onChange={(e) => setTerminalSettings(prev => ({ ...prev, compactMode: e.target.checked }))}
                          className="accent-emerald-400"
                        />
                        Compact
                      </label>

                      <label className="flex items-center gap-2 text-[11px]">
                        <input
                          type="checkbox"
                          checked={terminalSettings.cursorBlink}
                          onChange={(e) => setTerminalSettings(prev => ({ ...prev, cursorBlink: e.target.checked }))}
                          className="accent-emerald-400"
                        />
                        Blink
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); setHistory([]); }}
                className="hover:text-rose-400 transition-colors p-1 rounded hover:bg-gray-800/40"
                title="ক্লিয়ার স্ক্রিন"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {activeTabId !== 'console' && (
          <div className={`px-4 py-2 border-b ${theme.header} text-[11px] font-mono ${theme.muted}`}>
            <span className="uppercase tracking-wide">{activeTab?.label || 'Console'} mode active</span>
          </div>
        )}

        {/* Terminal Body / Output */}
        <div
          className={`flex-1 p-4 overflow-y-auto font-mono space-y-1.5 selection:bg-sky-500 selection:text-black ${terminalSettings.compactMode ? 'text-xs' : ''}`}
          style={{ fontSize: `${terminalSettings.fontSize}px`, lineHeight: terminalSettings.lineSpacing }}
        >
          {history.map((line, idx) => (
            <div key={idx} className={`whitespace-pre-wrap leading-relaxed ${getLineColor(line.type)}`}>
              {line.text}
            </div>
          ))}
          
          {isProcessing && (
            <div className={`${theme.muted} animate-pulse flex items-center gap-2 text-sm italic`}>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> প্রসেস হচ্ছে... অনুগ্রহ করে অপেক্ষা করুন...
            </div>
          )}
          <div ref={terminalEndRef} />
        </div>

        {/* Terminal Command Input */}
        <div className={`${theme.inputRow} p-3 border-t flex items-center space-x-2`}>
          <span className={`${theme.prompt} font-bold select-none shrink-0`}>user@bangla-terminal:~#</span>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isProcessing}
              className={`w-full bg-transparent border-none outline-none ${theme.inputText} font-mono focus:ring-0 p-0 m-0 ${terminalSettings.cursorBlink ? 'caret-emerald-400' : 'caret-transparent'}`}
              style={{ fontSize: `${terminalSettings.fontSize}px` }}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            {!input && !isProcessing && (
              <div className={`pointer-events-none absolute inset-0 flex items-center text-xs ${theme.muted} font-mono`}>
                Suggestion: help, ping, speed
              </div>
            )}
          </div>
        </div>

        <div
          onMouseDown={(e) => { e.preventDefault(); setIsResizing(true); }}
          className="h-2 w-full cursor-row-resize bg-gradient-to-r from-transparent via-sky-500/40 to-transparent"
          title="Resize terminal"
        />
      </div>

      {/* Terminal Info/Footer Quick Guide */}
      <div className="w-full max-w-5xl mt-4 px-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-500 font-mono">
        <div className="flex items-center gap-2 bg-[#0d1527]/50 p-2 rounded border border-gray-900">
          <Wifi className="w-4 h-4 text-emerald-500" />
          <span><strong>সঠিক পিং টিউটোরিয়াল:</strong> `ping 8.8.8.8`</span>
        </div>
        <div className="flex items-center gap-2 bg-[#0d1527]/50 p-2 rounded border border-gray-900">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <span><strong>ভুল হ্যান্ডলিং:</strong> ইনপুট ভুল হলে টার্মিনাল তা বাংলায় নোটিফাই করবে।</span>
        </div>
        <div className="flex items-center gap-2 bg-[#0d1527]/50 p-2 rounded border border-gray-900">
          <HelpCircle className="w-4 h-4 text-amber-500" />
          <span><strong>হেল্প কমান্ড:</strong> অন্য ফিচার দেখতে `help` টাইপ করুন।</span>
        </div>
      </div>
    </div>
  );
}

export default App;
