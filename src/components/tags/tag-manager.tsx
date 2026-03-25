'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { createTag, updateTag, deleteTag } from '@/actions/tags';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/toast';
import { Pencil, Trash2, Plus } from 'lucide-react';
import type { Tag } from '@/types';

interface TagManagerProps {
  tags: Tag[];
}

export function TagManager({ tags }: TagManagerProps) {
  const t = useTranslations('tags');
  const [newTagName, setNewTagName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(false);

  const defaultTags = tags.filter((t) => t.is_default);
  const customTags = tags.filter((t) => !t.is_default);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTagName.trim()) return;
    setLoading(true);

    const result = await createTag({ name: newTagName.trim() });
    if (result.success) {
      setNewTagName('');
      toast(t('messages.created'), 'success');
    } else {
      toast(result.error || t('messages.createFailed'), 'error');
    }
    setLoading(false);
  }

  async function handleUpdate(tagId: string) {
    if (!editName.trim()) return;
    setLoading(true);

    const result = await updateTag(tagId, { name: editName.trim() });
    if (result.success) {
      setEditingId(null);
      toast(t('messages.updated'), 'success');
    } else {
      toast(result.error || t('messages.updateFailed'), 'error');
    }
    setLoading(false);
  }

  async function handleDelete(tagId: string) {
    setLoading(true);
    const result = await deleteTag(tagId);
    if (result.success) {
      toast(t('messages.deleted'), 'success');
    } else {
      toast(result.error || t('messages.deleteFailed'), 'error');
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">{t('create.title')}</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex gap-2">
            <Input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder={t('form.name')}
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !newTagName.trim()}>
              <Plus className="mr-1 h-4 w-4" />
              {t('create.button')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {defaultTags.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">{t('sections.default')}</h2>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {defaultTags.map((tag) => (
                <Badge key={tag.id} variant="secondary">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">
            {t('actions.count', {count: customTags.length})}
          </h2>
        </CardHeader>
        <CardContent>
          {customTags.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {customTags.map((tag) => (
                <div key={tag.id} className="flex items-center justify-between py-3">
                  {editingId === tag.id ? (
                    <div className="flex flex-1 items-center gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={() => handleUpdate(tag.id)}
                        disabled={loading}
                      >
                        {t('form.save')}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingId(null)}
                      >
                        {t('form.cancel')}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm text-gray-900">{tag.name}</span>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingId(tag.id);
                            setEditName(tag.name);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(tag.id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-gray-500">
              {t('empty')}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
