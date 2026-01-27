
import { NextRequest, NextResponse } from 'next/server';
import { Models } from '@/db/models';
import { CharacterUpdate } from '@/db/schema';
import { getAuthUser } from '@/app/api/auth-helper';

// Helper to check project ownership
async function checkProjectOwnership(projectId: number, userId: number) {
    const project = await Models.projects.findById(projectId);
    if (!project) return null;
    if (project.user_id !== userId) return false;
    return true;
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; charId: string }> }
) {
    const user = getAuthUser(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.userId;
    const { id, charId } = await params;
    const projectId = parseInt(id);
    const cId = parseInt(charId);

    const isOwner = await checkProjectOwnership(projectId, userId);
    if (isOwner === null) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    if (isOwner === false) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const character = await Models.characters.findById(cId);
    if (!character) {
        return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }
    if (character.project_id !== projectId) {
        return NextResponse.json({ error: 'Character does not belong to this project' }, { status: 400 });
    }

    try {
        const body = await request.json();
        const { name, description, alias, avatar_url, tags } = body;

        const updates: CharacterUpdate = {};
        if (name !== undefined) updates.name = name;
        if (description !== undefined) updates.description = description;
        if (alias !== undefined) updates.alias = alias;
        if (avatar_url !== undefined) updates.avatar_url = avatar_url;
        if (tags !== undefined) updates.tags = JSON.stringify(tags);

        const updated = await Models.characters.update(cId, updates);
        return NextResponse.json(updated);
    } catch (error) {
        console.error('Update character error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; charId: string }> }
) {
    const user = getAuthUser(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.userId;
    const { id, charId } = await params;
    const projectId = parseInt(id);
    const cId = parseInt(charId);

    const isOwner = await checkProjectOwnership(projectId, userId);
    if (isOwner === null) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    if (isOwner === false) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    try {
        await Models.characters.softDelete(cId);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete character error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
