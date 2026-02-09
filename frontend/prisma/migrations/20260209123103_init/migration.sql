-- CreateTable
CREATE TABLE "users" (
    "user_id" TEXT NOT NULL,
    "nickname" VARCHAR(50) NOT NULL,
    "age" SMALLINT NOT NULL,
    "language" VARCHAR(5) NOT NULL DEFAULT 'en',
    "country" VARCHAR(100),
    "preferred_input_method" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_active" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "conversation_sessions" (
    "session_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "status" VARCHAR(20) NOT NULL,
    "language" VARCHAR(5),

    CONSTRAINT "conversation_sessions_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "conversation_messages" (
    "message_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "content" TEXT NOT NULL,
    "input_method" VARCHAR(20),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gemini_metadata" JSONB,

    CONSTRAINT "conversation_messages_pkey" PRIMARY KEY ("message_id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "profile_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "session_id" TEXT,
    "interests" TEXT[],
    "strengths" TEXT[],
    "values" TEXT[],
    "learning_style" VARCHAR(50),
    "motivation_level" SMALLINT,
    "career_preferences" JSONB,
    "mental_health_flags" TEXT[],
    "analysis_completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gemini_analysis_raw" JSONB,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("profile_id")
);

-- CreateTable
CREATE TABLE "career_recommendations" (
    "recommendation_id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "career_path_id" VARCHAR(50) NOT NULL,
    "career_name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "match_reason" TEXT,
    "skills_needed" TEXT[],
    "example_jobs" TEXT[],
    "education_path" TEXT,
    "growth_potential" TEXT,
    "is_custom" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "career_recommendations_pkey" PRIMARY KEY ("recommendation_id")
);

-- CreateTable
CREATE TABLE "user_selected_careers" (
    "selection_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "recommendation_id" TEXT NOT NULL,
    "selected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_selected_careers_pkey" PRIMARY KEY ("selection_id")
);

-- CreateTable
CREATE TABLE "vision_board_images" (
    "image_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "recommendation_id" TEXT,
    "style" VARCHAR(50) NOT NULL,
    "image_url" TEXT NOT NULL,
    "gemini_prompt" TEXT,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "safety_check_passed" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "vision_board_images_pkey" PRIMARY KEY ("image_id")
);

-- CreateTable
CREATE TABLE "user_feedback" (
    "feedback_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "session_id" TEXT,
    "rating" SMALLINT NOT NULL,
    "feedback_text" TEXT,
    "feedback_type" VARCHAR(50),
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_feedback_pkey" PRIMARY KEY ("feedback_id")
);

-- AddForeignKey
ALTER TABLE "conversation_sessions" ADD CONSTRAINT "conversation_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_messages" ADD CONSTRAINT "conversation_messages_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "conversation_sessions"("session_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "conversation_sessions"("session_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_recommendations" ADD CONSTRAINT "career_recommendations_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "user_profiles"("profile_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_selected_careers" ADD CONSTRAINT "user_selected_careers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_selected_careers" ADD CONSTRAINT "user_selected_careers_recommendation_id_fkey" FOREIGN KEY ("recommendation_id") REFERENCES "career_recommendations"("recommendation_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vision_board_images" ADD CONSTRAINT "vision_board_images_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vision_board_images" ADD CONSTRAINT "vision_board_images_recommendation_id_fkey" FOREIGN KEY ("recommendation_id") REFERENCES "career_recommendations"("recommendation_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_feedback" ADD CONSTRAINT "user_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_feedback" ADD CONSTRAINT "user_feedback_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "conversation_sessions"("session_id") ON DELETE SET NULL ON UPDATE CASCADE;
