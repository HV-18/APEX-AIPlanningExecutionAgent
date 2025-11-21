-- Enable realtime for workspace and marketplace tables
ALTER PUBLICATION supabase_realtime ADD TABLE workspace_activities;
ALTER PUBLICATION supabase_realtime ADD TABLE workspace_automation_rules;
ALTER PUBLICATION supabase_realtime ADD TABLE workspace_dashboard_widgets;
ALTER PUBLICATION supabase_realtime ADD TABLE workspace_favorites;
ALTER PUBLICATION supabase_realtime ADD TABLE workspace_files;
ALTER PUBLICATION supabase_realtime ADD TABLE workspace_integrations;
ALTER PUBLICATION supabase_realtime ADD TABLE workspace_members;
ALTER PUBLICATION supabase_realtime ADD TABLE workspace_tags;
ALTER PUBLICATION supabase_realtime ADD TABLE workspace_templates;
ALTER PUBLICATION supabase_realtime ADD TABLE workspace_versions;
ALTER PUBLICATION supabase_realtime ADD TABLE generated_images;
ALTER PUBLICATION supabase_realtime ADD TABLE marketplace_templates;
ALTER PUBLICATION supabase_realtime ADD TABLE template_ratings;