// main function to calculate the final grade that will be received in CSS 343
function calculateGrade() {
    // gather grades from inputs
    const program1 = parseInt(document.getElementById('program1').value);
    const program2 = parseInt(document.getElementById('program2').value);
    const program2p2 = parseInt(document.getElementById('program2p2').value);
    const garage = parseInt(document.getElementById('garage').value);
    const program3 = parseInt(document.getElementById('program3').value);
    const program4Design = parseInt(document.getElementById('program4Design').value);
    const feedback = parseInt(document.getElementById("feedback").value);
    const program4Program = parseInt(document.getElementById('program4Program').value);
    const midterm = parseInt(document.getElementById('midterm').value);
    const final = parseInt(document.getElementById('final').value);

    // constant values that will not change
    const programWeight = 0.35;
    const midtermWeight = 0.3;
    const finalWeight = 0.35;

    // actualProgramPoints = the number of points the student receieved for all Program submissions
    let actualProgramPoints = 0;

    // possibleProgramPoints = the maximum number of points that were possible for all Programs
    let possibleProgramPoints = 0;

    // if Program inputs are not default values, factor them into the calculation
    if (program1 != 0) 
    {
        possibleProgramPoints += 30;
        actualProgramPoints += program1;
    }
    if (program2 != 0)
    {
        possibleProgramPoints += 30;
        actualProgramPoints += program2;
    }
    if (program2p2 != 0)
    {
        possibleProgramPoints += 5;
        actualProgramPoints += program2p2;
    }
    if (garage != 0)
    {
        possibleProgramPoints += 5;
        actualProgramPoints += garage;
    }
    if (program3 != 0)
    {
        possibleProgramPoints += 30;
        actualProgramPoints += program3;
    }
    if (program4Design != 0)
    {
        possibleProgramPoints += 35;
        actualProgramPoints += 5;
        actualProgramPoints += program4Design;
    }
    if (feedback != 0)
    {
        possibleProgramPoints += 5;
        actualProgramPoints += feedback;
    }
    if (program4Program != 0)
    {
        possibleProgramPoints += 50;
        actualProgramPoints += program4Program;
    }

    // avoid dividing by zero
    if (possibleProgramPoints == 0) possibleProgramPoints = 1;

    // calculate the percentages for each category
    const programPercentage = actualProgramPoints / possibleProgramPoints;
    const midtermPercentage = midterm / 100;
    const finalPercentage = final / 100;

    // if the category is not empty, factor it into the calculation
    let totalPossiblePercentage = 0;
    let actualPercentage = 0;
    if (programPercentage != 0)
    {
        totalPossiblePercentage += programWeight;
        actualPercentage += programPercentage * programWeight;
    }
    if (midtermPercentage != 0)
    {
        totalPossiblePercentage += midtermWeight;
        actualPercentage += midtermPercentage * midtermWeight;
    }
    if (finalPercentage != 0)
    {
        totalPossiblePercentage += finalWeight;
        actualPercentage += finalPercentage * finalWeight;
    }

    // this is the final grade to be receieved in the class
    let classGradePercentage = (actualPercentage / totalPossiblePercentage) * 100;            

    // report that grade to the result element
    document.getElementById('result').innerHTML = `${classGradePercentage.toFixed(2)}%`;
}