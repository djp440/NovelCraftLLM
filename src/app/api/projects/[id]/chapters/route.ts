
import { NextRequest, NextResponse } from 'next/server';
import { Models } from '@/db/models';
import { NewChapter } from '@/db/schema';
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
    { params }: { params: Promise<{ id: string }> }
) {
    const user = getAuthUser(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.userId;
    const { id } = await params;
    const projectId = parseInt(id);

    const isOwner = await checkProjectOwnership(projectId, userId);
    if (isOwner === null) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    if (isOwner === false) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const chapters = await Models.chapters.findByProjectId(projectId);

    // Build tree
    const volumes = chapters.filter((c) => c.type === 'volume');
    const looseChapters = chapters.filter((c) => c.type === 'chapter' && !c.parent_id);

    // Map chapters to volumes
    const volumeMap = volumes.map((v) => {
        const children = chapters.filter((c) => c.parent_id === v.id);
        return { ...v, children };
    });

    return NextResponse.json({
        volumes: volumeMap,
        chapters: looseChapters // Chapters not in any volume
    });
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = getAuthUser(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.userId;
    const { id } = await params;
    const projectId = parseInt(id);

    const isOwner = await checkProjectOwnership(projectId, userId);
    if (isOwner === null) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    if (isOwner === false) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    try {
        const body = await request.json();
        const { title, content, type, parent_id, order_index } = body;

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        const newChapter: NewChapter = {
            project_id: projectId,
            title,
            content: content || '', // Volumes might have empty content
            type: type || 'chapter',
            parent_id: parent_id || null,
            order_index: order_index || 0,
        };

        const created = await Models.chapters.create(newChapter);
        return NextResponse.json(created);
    } catch (error) {
        console.error('Create chapter error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
