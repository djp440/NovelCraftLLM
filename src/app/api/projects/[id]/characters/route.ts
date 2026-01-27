
import { NextRequest, NextResponse } from 'next/server';
import { Models } from '@/db/models';
import { NewCharacter } from '@/db/schema';
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

    const characters = await Models.characters.findByProjectId(projectId);
    return NextResponse.json(characters);
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
        const { name, description, alias, avatar_url, tags } = body;

        if (!name || !description) {
            return NextResponse.json({ error: 'Name and description are required' }, { status: 400 });
        }

        const newCharacter: NewCharacter = {
            project_id: projectId,
            name,
            description,
            alias: alias || null,
            avatar_url: avatar_url || null,
            tags: tags ? JSON.stringify(tags) : null,
        };

        const created = await Models.characters.create(newCharacter);
        return NextResponse.json(created);
    } catch (error) {
        console.error('Create character error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
