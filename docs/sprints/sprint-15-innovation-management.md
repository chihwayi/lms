# Sprint 15: Innovation Submission & Management System

**Sprint Duration**: 2 weeks  
**Sprint Goal**: Implement comprehensive innovation submission portal with review workflow and tracking system  
**Team Velocity Target**: 55 story points  

## Sprint Objectives

1. Create innovation submission portal with multi-step wizard
2. Implement innovation categorization and tagging system
3. Build reviewer assignment and management system
4. Develop scoring rubrics and evaluation framework
5. Create innovation tracking and status management
6. Implement collaboration features for team submissions

## User Stories

### Epic: Innovation Management Platform
**Total Points**: 55

#### Story 1: Innovation Submission Portal
**Story Points**: 18  
**Priority**: High  
**Assignee**: Full-Stack Developer + UI/UX Designer

**As an** innovator  
**I want** to submit my innovation idea through a structured process  
**So that** it can be properly evaluated and considered for funding

**Acceptance Criteria**:
- [ ] Multi-step submission wizard with progress indicator
- [ ] Auto-save functionality every 30 seconds
- [ ] Support for team collaboration on submissions
- [ ] File upload for supporting documents (pitch decks, prototypes, etc.)
- [ ] Rich text editor for detailed descriptions
- [ ] Budget breakdown with validation
- [ ] Impact metrics and projections
- [ ] Draft and submit functionality
- [ ] Submission confirmation and tracking number

**Technical Requirements**:
- Form wizard with step validation
- Real-time collaboration using WebSockets
- File upload with virus scanning
- Rich text editor with formatting options
- Auto-save mechanism with conflict resolution
- Email notifications for submission events

**Submission Wizard Steps**:
1. **Basic Information**: Title, category, team members
2. **Problem Statement**: Problem description, target audience, market size
3. **Solution Details**: Proposed solution, methodology, uniqueness
4. **Implementation Plan**: Timeline, milestones, resources needed
5. **Budget & Resources**: Detailed budget breakdown, resource requirements
6. **Impact & Metrics**: Expected outcomes, success metrics, social impact
7. **Supporting Materials**: Documents, prototypes, presentations
8. **Review & Submit**: Final review, terms acceptance, submission

**Database Schema**:
```sql
CREATE TABLE innovations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    category_id UUID REFERENCES innovation_categories(id),
    stage innovation_stage DEFAULT 'draft',
    submitter_id UUID REFERENCES users(id) NOT NULL,
    team_members UUID[] DEFAULT '{}',
    problem_statement TEXT NOT NULL,
    target_audience TEXT,
    market_size TEXT,
    solution_description TEXT NOT NULL,
    methodology TEXT,
    uniqueness_factors TEXT,
    implementation_timeline JSONB,
    budget_breakdown JSONB NOT NULL,
    total_budget DECIMAL(12,2),
    impact_metrics JSONB,
    success_criteria TEXT,
    social_impact TEXT,
    supporting_documents JSONB DEFAULT '[]',
    submission_data JSONB,
    submitted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE innovation_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7), -- Hex color code
    icon VARCHAR(50),
    parent_id UUID REFERENCES innovation_categories(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE innovation_team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    innovation_id UUID REFERENCES innovations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    role VARCHAR(100) NOT NULL,
    contribution_percentage DECIMAL(5,2),
    joined_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE innovation_stage AS ENUM (
    'draft', 'submitted', 'under_review', 'pending_revision', 
    'approved', 'rejected', 'funded', 'in_progress', 'completed', 'cancelled'
);
```

**API Endpoints**:
```typescript
POST /api/v1/innovations
GET /api/v1/innovations
GET /api/v1/innovations/:id
PUT /api/v1/innovations/:id
DELETE /api/v1/innovations/:id
POST /api/v1/innovations/:id/submit
POST /api/v1/innovations/:id/team-members
DELETE /api/v1/innovations/:id/team-members/:userId
POST /api/v1/innovations/:id/documents
GET /api/v1/innovation-categories
```

**Frontend Components**:
```typescript
// Innovation submission wizard
interface InnovationWizardProps {
  innovationId?: string;
  onComplete: (innovation: Innovation) => void;
  onSave: (innovation: Partial<Innovation>) => void;
}

// Step components
const WizardSteps = [
  BasicInformationStep,
  ProblemStatementStep,
  SolutionDetailsStep,
  ImplementationPlanStep,
  BudgetResourcesStep,
  ImpactMetricsStep,
  SupportingMaterialsStep,
  ReviewSubmitStep
];

// Auto-save hook
const useAutoSave = (data: any, saveFunction: Function, interval = 30000) => {
  // Implementation for auto-save functionality
};
```

**Definition of Done**:
- [ ] Complete submission wizard works end-to-end
- [ ] Auto-save prevents data loss
- [ ] Team collaboration features function
- [ ] File uploads work reliably
- [ ] Form validation prevents invalid submissions
- [ ] Email notifications are sent
- [ ] Mobile responsive design
- [ ] Accessibility compliance (WCAG 2.1 AA)

---

#### Story 2: Innovation Review & Scoring System
**Story Points**: 15  
**Priority**: High  
**Assignee**: Backend Developer + Frontend Developer

**As a** reviewer  
**I want** to evaluate innovation submissions systematically  
**So that** I can provide fair and consistent assessments

**Acceptance Criteria**:
- [ ] Reviewer dashboard with assigned innovations
- [ ] Customizable scoring rubrics with weighted criteria
- [ ] Rich text feedback editor with templates
- [ ] Blind review option to hide submitter identity
- [ ] Review deadline tracking and reminders
- [ ] Conflict of interest declaration
- [ ] Review status tracking and workflow
- [ ] Batch operations for multiple reviews

**Technical Requirements**:
- Flexible rubric system with configurable criteria
- Review workflow state machine
- Email notification system for reviewers
- Review analytics and reporting
- Reviewer workload balancing

**Scoring Rubric System**:
```typescript
interface ScoringRubric {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  criteria: RubricCriterion[];
  totalWeight: number;
  isActive: boolean;
}

interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  weight: number; // Percentage of total score
  maxScore: number;
  scoreDescriptions: ScoreDescription[];
}

interface ScoreDescription {
  score: number;
  label: string;
  description: string;
}

interface InnovationReview {
  id: string;
  innovationId: string;
  reviewerId: string;
  rubricId: string;
  scores: CriterionScore[];
  overallScore: number;
  feedback: string;
  recommendation: ReviewRecommendation;
  timeSpent: number; // minutes
  isBlindReview: boolean;
  conflictOfInterest: boolean;
  status: ReviewStatus;
  submittedAt?: Date;
}

enum ReviewRecommendation {
  STRONGLY_APPROVE = 'strongly_approve',
  APPROVE = 'approve',
  APPROVE_WITH_CONDITIONS = 'approve_with_conditions',
  REJECT = 'reject',
  NEEDS_REVISION = 'needs_revision'
}

enum ReviewStatus {
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  OVERDUE = 'overdue'
}
```

**Database Schema**:
```sql
CREATE TABLE scoring_rubrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES innovation_categories(id),
    criteria JSONB NOT NULL,
    total_weight DECIMAL(5,2) DEFAULT 100.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE innovation_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    innovation_id UUID REFERENCES innovations(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(id),
    rubric_id UUID REFERENCES scoring_rubrics(id),
    scores JSONB NOT NULL,
    overall_score DECIMAL(5,2),
    feedback TEXT,
    recommendation review_recommendation,
    time_spent INTEGER, -- minutes
    is_blind_review BOOLEAN DEFAULT FALSE,
    conflict_of_interest BOOLEAN DEFAULT FALSE,
    status review_status DEFAULT 'assigned',
    assigned_at TIMESTAMP DEFAULT NOW(),
    submitted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE reviewer_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    innovation_id UUID REFERENCES innovations(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(id),
    assigned_by UUID REFERENCES users(id),
    due_date TIMESTAMP,
    priority INTEGER DEFAULT 1,
    notes TEXT,
    assigned_at TIMESTAMP DEFAULT NOW()
);
```

**API Endpoints**:
```typescript
GET /api/v1/reviews/dashboard
GET /api/v1/reviews/assigned
GET /api/v1/innovations/:id/reviews
POST /api/v1/innovations/:id/reviews
PUT /api/v1/reviews/:id
POST /api/v1/reviews/:id/submit
GET /api/v1/scoring-rubrics
POST /api/v1/scoring-rubrics
PUT /api/v1/scoring-rubrics/:id
POST /api/v1/innovations/:id/assign-reviewers
```

**Definition of Done**:
- [ ] Reviewer dashboard displays assigned innovations
- [ ] Scoring rubrics work with all criterion types
- [ ] Review submission calculates scores correctly
- [ ] Blind review hides submitter information
- [ ] Deadline reminders are sent automatically
- [ ] Conflict of interest workflow functions
- [ ] Review analytics are accurate
- [ ] Batch operations work efficiently

---

#### Story 3: Innovation Status Tracking & Workflow
**Story Points**: 12  
**Priority**: High  
**Assignee**: Backend Developer

**As an** innovation stakeholder  
**I want** to track innovation progress through the evaluation process  
**So that** I can understand the current status and next steps

**Acceptance Criteria**:
- [ ] Innovation status workflow with clear transitions
- [ ] Automated status updates based on review completion
- [ ] Status history and audit trail
- [ ] Notification system for status changes
- [ ] Dashboard views for different stakeholder types
- [ ] Bulk status operations for administrators
- [ ] Status-based filtering and reporting
- [ ] Integration with funding and implementation tracking

**Technical Requirements**:
- State machine implementation for status workflow
- Event-driven architecture for status changes
- Comprehensive audit logging
- Real-time notifications via WebSocket
- Role-based dashboard customization

**Innovation Workflow States**:
```typescript
enum InnovationStage {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  PENDING_REVISION = 'pending_revision',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FUNDED = 'funded',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

interface StatusTransition {
  from: InnovationStage;
  to: InnovationStage;
  conditions?: TransitionCondition[];
  actions?: TransitionAction[];
  requiredRole?: UserRole[];
}

interface TransitionCondition {
  type: 'review_count' | 'average_score' | 'approval_count' | 'custom';
  operator: 'gte' | 'lte' | 'eq' | 'ne';
  value: any;
}

interface TransitionAction {
  type: 'send_notification' | 'create_task' | 'update_field' | 'trigger_webhook';
  config: any;
}
```

**Workflow Configuration**:
```typescript
const INNOVATION_WORKFLOW: StatusTransition[] = [
  {
    from: InnovationStage.DRAFT,
    to: InnovationStage.SUBMITTED,
    conditions: [
      { type: 'custom', operator: 'eq', value: 'all_required_fields_complete' }
    ],
    actions: [
      { type: 'send_notification', config: { template: 'innovation_submitted' } },
      { type: 'create_task', config: { type: 'assign_reviewers' } }
    ]
  },
  {
    from: InnovationStage.SUBMITTED,
    to: InnovationStage.UNDER_REVIEW,
    conditions: [
      { type: 'review_count', operator: 'gte', value: 1 }
    ]
  },
  {
    from: InnovationStage.UNDER_REVIEW,
    to: InnovationStage.APPROVED,
    conditions: [
      { type: 'review_count', operator: 'gte', value: 3 },
      { type: 'average_score', operator: 'gte', value: 7.0 }
    ],
    actions: [
      { type: 'send_notification', config: { template: 'innovation_approved' } },
      { type: 'trigger_webhook', config: { event: 'innovation.approved' } }
    ]
  }
  // Additional transitions...
];
```

**Database Schema**:
```sql
CREATE TABLE innovation_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    innovation_id UUID REFERENCES innovations(id) ON DELETE CASCADE,
    from_stage innovation_stage,
    to_stage innovation_stage NOT NULL,
    changed_by UUID REFERENCES users(id),
    reason TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE innovation_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    innovation_id UUID REFERENCES innovations(id) ON DELETE CASCADE,
    task_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES users(id),
    due_date TIMESTAMP,
    status task_status DEFAULT 'pending',
    priority INTEGER DEFAULT 1,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
```

**API Endpoints**:
```typescript
GET /api/v1/innovations/:id/status-history
POST /api/v1/innovations/:id/status
GET /api/v1/innovations/dashboard/:role
GET /api/v1/innovations/statistics
POST /api/v1/innovations/bulk-status-update
GET /api/v1/innovation-tasks
POST /api/v1/innovation-tasks
PUT /api/v1/innovation-tasks/:id
```

**Definition of Done**:
- [ ] Status workflow transitions work correctly
- [ ] Automated status updates trigger properly
- [ ] Status history is accurately maintained
- [ ] Notifications are sent for status changes
- [ ] Dashboard views show relevant information
- [ ] Bulk operations handle large datasets
- [ ] Audit trail captures all changes
- [ ] Performance is acceptable with many innovations

---

#### Story 4: Innovation Categories & Tagging System
**Story Points**: 6  
**Priority**: Medium  
**Assignee**: Backend Developer + Frontend Developer

**As an** innovation manager  
**I want** to organize innovations by categories and tags  
**So that** I can better manage and analyze submissions

**Acceptance Criteria**:
- [ ] Hierarchical category system with subcategories
- [ ] Tag system for flexible labeling
- [ ] Category-specific submission templates
- [ ] Filtering and search by categories and tags
- [ ] Category analytics and reporting
- [ ] Admin interface for category management
- [ ] Bulk categorization operations
- [ ] Category-based reviewer assignment

**Technical Requirements**:
- Tree structure for hierarchical categories
- Full-text search integration with categories and tags
- Category-specific configuration options
- Analytics aggregation by category
- Efficient querying for large datasets

**Category System**:
```typescript
interface InnovationCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  parentId?: string;
  children?: InnovationCategory[];
  submissionTemplate?: SubmissionTemplate;
  reviewerPool?: string[];
  isActive: boolean;
  metadata: CategoryMetadata;
}

interface CategoryMetadata {
  submissionCount: number;
  averageScore: number;
  approvalRate: number;
  averageReviewTime: number;
  topTags: string[];
}

interface SubmissionTemplate {
  requiredFields: string[];
  optionalFields: string[];
  customFields: CustomField[];
  budgetCategories: string[];
  impactMetrics: string[];
}
```

**API Endpoints**:
```typescript
GET /api/v1/innovation-categories/tree
POST /api/v1/innovation-categories
PUT /api/v1/innovation-categories/:id
DELETE /api/v1/innovation-categories/:id
GET /api/v1/innovation-categories/:id/analytics
GET /api/v1/innovation-tags
POST /api/v1/innovation-tags
GET /api/v1/innovations/search?category=:id&tags=:tags
```

**Definition of Done**:
- [ ] Category hierarchy displays correctly
- [ ] Tag system allows flexible labeling
- [ ] Category-specific templates work
- [ ] Search and filtering by category/tags functions
- [ ] Analytics show category insights
- [ ] Admin interface is user-friendly
- [ ] Performance is good with many categories
- [ ] Data integrity is maintained

---

#### Story 5: Innovation Collaboration Features
**Story Points**: 4  
**Priority**: Low  
**Assignee**: Frontend Developer

**As an** innovation team member  
**I want** to collaborate on innovation submissions  
**So that** we can work together effectively

**Acceptance Criteria**:
- [ ] Real-time collaborative editing
- [ ] Team member invitation system
- [ ] Role-based permissions within teams
- [ ] Comment and suggestion system
- [ ] Version history and change tracking
- [ ] Conflict resolution for simultaneous edits
- [ ] Team communication features
- [ ] Activity feed for team actions

**Technical Requirements**:
- WebSocket-based real-time collaboration
- Operational transformation for conflict resolution
- Permission system for team roles
- Activity logging and notifications
- Version control system

**Collaboration Features**:
```typescript
interface TeamMember {
  userId: string;
  role: TeamRole;
  permissions: TeamPermission[];
  joinedAt: Date;
  invitedBy: string;
}

enum TeamRole {
  OWNER = 'owner',
  EDITOR = 'editor',
  REVIEWER = 'reviewer',
  VIEWER = 'viewer'
}

enum TeamPermission {
  EDIT_CONTENT = 'edit_content',
  INVITE_MEMBERS = 'invite_members',
  MANAGE_PERMISSIONS = 'manage_permissions',
  SUBMIT_INNOVATION = 'submit_innovation',
  DELETE_INNOVATION = 'delete_innovation'
}

interface CollaborationEvent {
  type: 'edit' | 'comment' | 'invite' | 'submit';
  userId: string;
  timestamp: Date;
  data: any;
}
```

**Definition of Done**:
- [ ] Real-time editing works without conflicts
- [ ] Team invitation system functions
- [ ] Role permissions are enforced
- [ ] Comments and suggestions work
- [ ] Version history is maintained
- [ ] Activity feed shows team actions
- [ ] Performance is acceptable with multiple users
- [ ] Data consistency is maintained

## Technical Specifications

### Innovation Data Model

```typescript
interface Innovation {
  id: string;
  title: string;
  category: InnovationCategory;
  stage: InnovationStage;
  submitter: User;
  teamMembers: TeamMember[];
  
  // Problem & Solution
  problemStatement: string;
  targetAudience: string;
  marketSize: string;
  solutionDescription: string;
  methodology: string;
  uniquenessFactors: string;
  
  // Implementation
  implementationTimeline: Milestone[];
  budgetBreakdown: BudgetItem[];
  totalBudget: number;
  resourceRequirements: Resource[];
  
  // Impact
  impactMetrics: ImpactMetric[];
  successCriteria: string;
  socialImpact: string;
  
  // Supporting Materials
  documents: Document[];
  prototypes: Prototype[];
  presentations: Presentation[];
  
  // Metadata
  tags: string[];
  reviews: InnovationReview[];
  statusHistory: StatusChange[];
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Real-time Collaboration System

```typescript
// WebSocket events for collaboration
interface CollaborationEvents {
  'innovation:join': { innovationId: string; userId: string };
  'innovation:leave': { innovationId: string; userId: string };
  'innovation:edit': { innovationId: string; field: string; value: any; userId: string };
  'innovation:comment': { innovationId: string; comment: Comment; userId: string };
  'innovation:cursor': { innovationId: string; position: CursorPosition; userId: string };
}

// Operational transformation for conflict resolution
class OperationalTransform {
  static transform(op1: Operation, op2: Operation): [Operation, Operation] {
    // Implementation for handling simultaneous edits
  }
}
```

### Review Assignment Algorithm

```typescript
class ReviewerAssignmentService {
  async assignReviewers(innovationId: string, count: number = 3): Promise<string[]> {
    const innovation = await this.getInnovation(innovationId);
    const availableReviewers = await this.getAvailableReviewers(innovation.category);
    
    // Scoring algorithm considering:
    // - Expertise match
    // - Workload balance
    // - Conflict of interest
    // - Past performance
    
    return this.selectOptimalReviewers(availableReviewers, count);
  }
}
```

## Testing Strategy

### Unit Tests
- Innovation CRUD operations
- Status workflow transitions
- Review scoring calculations
- Category hierarchy operations
- Collaboration event handling

### Integration Tests
- Complete submission workflow
- Review assignment process
- Status change notifications
- Real-time collaboration
- File upload and processing

### End-to-End Tests
- Innovation submission wizard
- Review and scoring process
- Team collaboration features
- Status tracking dashboard
- Category management

### Performance Tests
- Large innovation datasets
- Concurrent collaboration sessions
- Review assignment scalability
- Search and filtering performance
- Real-time event handling

## Risk Assessment

### High Risks
1. **Real-time Collaboration Complexity**: Conflict resolution can be challenging
   - **Mitigation**: Use proven libraries (ShareJS, Yjs), extensive testing
2. **Review Assignment Fairness**: Algorithm bias could affect outcomes
   - **Mitigation**: Transparent criteria, regular algorithm audits
3. **Data Integrity**: Concurrent edits may cause data corruption
   - **Mitigation**: Proper locking mechanisms, transaction management

### Medium Risks
1. **Scalability**: Large number of innovations and reviewers
   - **Mitigation**: Database optimization, caching strategies
2. **Notification Overload**: Too many notifications may annoy users
   - **Mitigation**: Smart notification batching, user preferences
3. **File Storage Costs**: Supporting documents can be large
   - **Mitigation**: File size limits, compression, lifecycle policies

## Sprint Deliverables

### Backend Deliverables
- [ ] Innovation management API
- [ ] Review and scoring system
- [ ] Status workflow engine
- [ ] Category management system
- [ ] Real-time collaboration backend
- [ ] Notification system
- [ ] Database migrations

### Frontend Deliverables
- [ ] Innovation submission wizard
- [ ] Review dashboard and interface
- [ ] Status tracking views
- [ ] Category management UI
- [ ] Collaboration features
- [ ] Mobile-responsive design

### Integration Deliverables
- [ ] WebSocket server for real-time features
- [ ] Email notification templates
- [ ] File upload and processing
- [ ] Search integration
- [ ] Analytics and reporting

## Success Criteria

### Functional Success
- [ ] Complete innovation submission works end-to-end
- [ ] Review process is efficient and fair
- [ ] Status tracking provides clear visibility
- [ ] Collaboration features enable teamwork
- [ ] Category system organizes innovations effectively

### Technical Success
- [ ] Real-time collaboration works without conflicts
- [ ] Review assignment algorithm is fair and efficient
- [ ] Status workflow handles all edge cases
- [ ] Performance meets requirements under load
- [ ] Data integrity is maintained

### User Experience Success
- [ ] Submission wizard is intuitive and helpful
- [ ] Review interface is efficient for reviewers
- [ ] Status updates are timely and informative
- [ ] Collaboration feels natural and responsive
- [ ] Mobile experience is excellent

## Next Sprint Preparation

### Sprint 16 Preview
- Innovation review dashboard enhancements
- Advanced scoring analytics
- Innovation funding workflow
- Public innovation showcase
- Integration with mentorship system

### Dependencies for Sprint 16
- Innovation management system complete
- Review system fully functional
- User notification system working
- File storage and CDN operational

---

**Sprint Review Date**: End of Week 30  
**Sprint Retrospective**: After Sprint Review  
**Sprint 16 Planning**: First day of Week 31