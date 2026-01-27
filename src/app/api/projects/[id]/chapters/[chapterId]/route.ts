
import { NextRequest, NextResponse } from 'next/server';
import { Models } from '@/db/models';
import { ChapterUpdate } from '@/db/schema';
import { getAuthUser } from '@/app/api/auth-helper';

// Helper to check project ownership
async function checkProjectOwnership(projectId: number, userId: number) {
    const project = await Models.projects.findById(projectId);
    if (!project) return null;
    if (project.user_id !== userId) return false;
    return true;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; chapterId: string }> }
) {
    const user = getAuthUser(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.userId;
    const { id, chapterId } = await params;
    const projectId = parseInt(id);
    const cId = parseInt(chapterId);

    const isOwner = await checkProjectOwnership(projectId, userId);
    if (isOwner === null) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    if (isOwner === false) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    try {
        const chapter = await Models.chapters.findById(cId);
        if (!chapter) {
            return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
        }
        if (chapter.project_id !== projectId) {
            return NextResponse.json({ error: 'Chapter does not belong to this project' }, { status: 400 });
        }

        return NextResponse.json(chapter);
    } catch (error) {
        console.error('Get chapter error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; chapterId: string }> }
) {
    const user = getAuthUser(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.userId;
    const { id, chapterId } = await params;
    const projectId = parseInt(id);
    const cId = parseInt(chapterId);

    const isOwner = await checkProjectOwnership(projectId, userId);
    if (isOwner === null) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    if (isOwner === false) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const chapter = await Models.chapters.findById(cId);
    if (!chapter) {
        return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }
    if (chapter.project_id !== projectId) {
        return NextResponse.json({ error: 'Chapter does not belong to this project' }, { status: 400 });
    }

    try {
        const body = await request.json();
        const { title, content, parent_id, order_index, create_version } = body;

        const updates: ChapterUpdate = {};
        if (title !== undefined) updates.title = title;
        if (content !== undefined) {
            updates.content = content;
            updates.word_count = content.length;
        }
        if (parent_id !== undefined) updates.parent_id = parent_id;
        if (order_index !== undefined) updates.order_index = order_index;

        // Handle version creation if requested
        if (create_version && content) {
            const versions = await Models.chapterVersions.findByChapterId(cId);
            const maxVersion = versions.length > 0 ? Math.max(...versions.map(v => v.version_number)) : 0;
            const newVersionNum = maxVersion + 1;

            if (versions.length >= 10) {
                await Models.chapterVersions.cleanupOldVersions(cId);
            }

            await Models.chapterVersions.create({
                chapter_id: cId,
                version_number: newVersionNum,
                content: content,
                created_at: new Date().toISOString()
            });
        }

        const updated = await Models.chapters.update(cId, updates);
        return NextResponse.json(updated);
    } catch (error) {
        console.error('Update chapter error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; chapterId: string }> }
) {
    const user = getAuthUser(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.userId;
    const { id, chapterId } = await params;
    const projectId = parseInt(id);
    const cId = parseInt(chapterId);

    const isOwner = await checkProjectOwnership(projectId, userId);
    if (isOwner === null) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    if (isOwner === false) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const chapter = await Models.chapters.findById(cId);
    if (!chapter) {
        return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    try {
        await Models.chapters.softDelete(cId);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete chapter error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
