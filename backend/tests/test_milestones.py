import pytest
import asyncio
from app.services.gemini_decomposer import gemini_decomposer
from app.services.escrow_manager import escrow_manager
from app.schemas.milestone import MilestoneVerifyRequest

@pytest.mark.asyncio
async def test_contract_decomposition():
    sample_sow = "Scope of Work: Build an Enterprise LLM RAG Pipeline with Qdrant vector database, LangGraph, and FastAPI. Total budget $1,500 USD."
    title, budget, milestones, dependencies = await gemini_decomposer.decompose_contract(
        raw_contract_text=sample_sow,
        project_title="Enterprise LLM RAG Pipeline",
        total_budget=1500.0,
        currency="USD"
    )

    assert title is not None
    assert budget == 1500.0
    assert len(milestones) >= 3
    
    # Check sum of milestone allocations equals total budget
    total_alloc = sum(m.amount for m in milestones)
    assert abs(total_alloc - 1500.0) < 0.05
    
    # Check Bryntum Gantt dependencies
    assert len(dependencies) >= 2
    assert dependencies[0].from_task == 1
    assert dependencies[0].to_task == 2

@pytest.mark.asyncio
async def test_milestone_verification_and_release():
    from app.api.endpoints import load_preset
    project = await load_preset("defi")
    assert project.total_budget == 2800.0
    
    # Milestone 3 is initially IN_PROGRESS or HELD_IN_ESCROW
    m3 = next((m for m in project.tasks if m.id == 3), None)
    assert m3 is not None
    assert m3.escrow_status == "HELD_IN_ESCROW"

    verify_req = MilestoneVerifyRequest(
        github_pr_url="https://github.com/milestonepay-ai/defi-engine/pull/3",
        commit_sha="c3f8e91024bd",
        test_suite_passed=True,
        ai_audit_score=99.2
    )

    result = await escrow_manager.verify_and_release_milestone(milestone_id=3, verify_req=verify_req)
    assert result.milestone_id == 3
    assert result.escrow_status == "RELEASED"
    assert result.status == "COMPLETED"
    assert result.verification_hash.startswith("sha256:")
    assert result.paypal_capture_id is not None

    # Summary check
    summary = escrow_manager.get_summary()
    assert summary.total_released >= 2100.0
