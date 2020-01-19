trigger SkillRequirementTrigger on SkillRequirement (before insert) {
    for (SkillRequirement sr : Trigger.New){
        Skill skillRecord = [SELECT ID, DeveloperName FROM SKILL WHERE ID = :sr.SkillId];
        if (skillRecord.DeveloperName == 'French'){
            sr.IsAdditionalSkill = true;
        }
    }
}