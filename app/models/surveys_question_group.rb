class SurveysQuestionGroup < ActiveRecord::Base
  acts_as_list scope: :survey
  belongs_to :rapidfire_question_group, class_name: "Rapidfire::QuestionGroup"
  belongs_to :survey

  def self.by_position(survey_id)
    has_pos = where("position is not null").order('position asc')
    null_pos = where("position is null").order('created_at asc')
    return has_pos+null_pos
  end

end