import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from '../hooks/useTranslation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, HelpCircle, Search, ExternalLink, MessageCircle } from 'lucide-react';
import knowledgeBase from '../data/chatbotKnowledgeBase.json';
import LanguageToggle from '../components/LanguageToggle';

interface KnowledgeEntry {
  id: number;
  patterns: string[];
  answer: string;
  pageLink: string;
}

export default function Help() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const entries = knowledgeBase as KnowledgeEntry[];

  const filtered = search
    ? entries.filter(
        (e) =>
          e.answer.toLowerCase().includes(search.toLowerCase()) ||
          e.patterns.some((p) => p.toLowerCase().includes(search.toLowerCase()))
      )
    : entries;

  // Generate a readable topic title from patterns
  const getTopicTitle = (entry: KnowledgeEntry): string => {
    const first = entry.patterns[0] ?? '';
    return first.charAt(0).toUpperCase() + first.slice(1).replace(/-/g, ' ');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-teal-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/assets/generated/scholarpath-logo.dim_128x128.png"
            alt="ScholarPath Logo"
            className="h-8 w-8 rounded-lg object-cover"
          />
          <div>
            <p className="font-bold text-sm">{t('nav.appName')}</p>
            <p className="text-teal-300 text-xs">{t('nav.tagline')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <Link to="/">
            <Button
              variant="ghost"
              size="sm"
              className="text-teal-200 hover:text-white hover:bg-teal-800 text-xs gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-teal-100 flex items-center justify-center mx-auto">
            <HelpCircle className="h-7 w-7 text-teal-700" />
          </div>
          <h1 className="text-2xl font-bold text-teal-900">{t('nav.help')} & FAQ</h1>
          <p className="text-gray-500 text-sm">
            Find answers to common questions about using ScholarPath
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search help topics..."
            className="pl-9 border-gray-200 focus:border-teal-400 bg-white"
          />
        </div>

        {/* FAQ Accordion */}
        <Card className="border-teal-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-teal-800">
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">
                No results found for "{search}"
              </p>
            ) : (
              <Accordion type="single" collapsible className="space-y-1">
                {filtered.map((entry) => (
                  <AccordionItem
                    key={entry.id}
                    value={`item-${entry.id}`}
                    className="border border-gray-100 rounded-lg px-3 data-[state=open]:border-teal-200 data-[state=open]:bg-teal-50/50"
                  >
                    <AccordionTrigger className="text-sm font-medium text-gray-800 hover:text-teal-800 hover:no-underline py-3">
                      {getTopicTitle(entry)}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-gray-600 pb-3 space-y-2">
                      <p>{entry.answer}</p>
                      <Link
                        to={entry.pageLink as any}
                        className="inline-flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-800 font-medium"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Go to {entry.pageLink === '/' ? 'Dashboard' : entry.pageLink.replace('/', '')}
                      </Link>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>

        {/* Chatbot CTA */}
        <Card className="border-teal-200 bg-teal-50 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-teal-700 flex items-center justify-center shrink-0">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-teal-900 text-sm">Still have questions?</p>
              <p className="text-xs text-teal-700 mt-0.5">
                Use our ScholarBot chatbot — click the chat icon at the bottom right of any page.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="text-center py-4 text-gray-400 text-xs border-t border-gray-100">
          © {new Date().getFullYear()} ScholarPath · Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              window.location.hostname || 'scholarpath'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-600 hover:underline"
          >
            caffeine.ai
          </a>
        </footer>
      </div>
    </div>
  );
}
