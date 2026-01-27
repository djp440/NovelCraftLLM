
import { NextRequest, NextResponse } from 'next/server';
import { Models } from '@/db/models';
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
        const versions = await Models.chapterVersions.findByChapterId(cId);
        return NextResponse.json(versions);
    } catch (error) {
        console.error('Get chapter versions error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
