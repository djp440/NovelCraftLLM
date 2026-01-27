
import { NextRequest, NextResponse } from 'next/server';
import { Models } from '@/db/models';
import { NewWorldBook } from '@/db/schema';
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

    const worldBook = await Models.worldBooks.findByProjectId(projectId);
    return NextResponse.json(worldBook || {});
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
        const { content, outline } = body;

        const newWorldBook: NewWorldBook = {
            project_id: projectId,
            content: content || '',
            outline: outline ? JSON.stringify(outline) : null,
        };

        const result = await Models.worldBooks.upsert(newWorldBook);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Update world book error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
