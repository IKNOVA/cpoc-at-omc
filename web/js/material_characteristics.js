// Code-behind pour le formulaire material_characteristics

omc.init();
user.init();

function clearMaterialFields()
{
    $('#material_price_per_ton').val('-');
    $('#part_price').val('-');
    $('#material_tensile_strength').val('-');
    $('#material_proof_stress').val('-');
    $('#material_hardness').val('-');
    $('#material_elongation').val('-');
    $('#material_weldability').val('-');
    $('#material_heat_treatability').val('-');
}

function setMaterialFields(grade)
{
    $('#material_price_per_ton').val(grade.characteristics.pricePerTon);
    $('#part_price').val(100);
    $('#material_tensile_strength').val(grade.characteristics.rm);
    $('#material_proof_stress').val(grade.characteristics.rp);
    $('#material_hardness').val(grade.characteristics.hb);
    $('#material_elongation').val(Number(grade.characteristics.a * 100).toFixed(2));
    $('#material_weldability').val(omc.materialDB.messages['weldability_' + grade.characteristics.s]);
    $('#material_heat_treatability').val(omc.materialDB.messages['heat_treatability_' + grade.characteristics.ts]);
}

jQuery($ => {
    var $gradeInput = $('#material_grade');
    var $familySelect = $('#material_family');
    
    function gradeChanged(gradeName)
    {
        var grade = omc.materialDB.grades.find(g => g.name == gradeName);
        console.debug('OMC', grade);

        if (grade)
        {
            $familySelect.val(grade.family);
            omc.saveUserMaterial(grade);
            setMaterialFields(grade);
        }
        else
        {
            if (gradeName != '')
            {
                $familySelect.val('-');
                console.debug('OMC', 'No matching grade');
            }
            omc.deleteUserMaterial();
            clearMaterialFields();
        }

        $familySelect.selectmenu('refresh');
    }

    function setGradeAutocompletion(family)
    {
        if (!omc.userMaterial || (family != omc.userMaterial.family))
        {
            $gradeInput.val('');
            clearMaterialFields();
        }

        var grades = omc.materialDB.grades.filter(grade => grade.family == family).map(grade => grade.name);

        $gradeInput.autocomplete({
            source: grades,
            select: (event,ui) => gradeChanged(ui.item.value)
        });
        // .focus(function() {    
        //     $(this).autocomplete({source: grades, select: (event,ui) => gradeChanged(ui.item.value)})
        // });
    }

    $('<option value="-">-</option>').appendTo($familySelect);
    $familySelect.selectmenu({ select: (event, ui) => setGradeAutocompletion(ui.item.value)});

    omc.withMaterialDB(db => {
        
        db.families.forEach(f => {
            var $optGroup = $('<optgroup />').attr('label', f.name);
            $optGroup.appendTo($familySelect);
            f.subfamilies.forEach(sf => $('<option />').val(sf.id).text(sf.name).appendTo($optGroup));
        });

        if (omc.userMaterial)
        {
            $familySelect.val(omc.userMaterial.family);
            $gradeInput.val(omc.userMaterial.name);
            setMaterialFields(omc.userMaterial);
            setGradeAutocompletion(omc.userMaterial.family);
        }

        $familySelect.selectmenu('refresh');
    });

    // Configuration du champs 'part number'
    $("#client_file_number").autocomplete({
        source : [ '1111', '2222', '1234', '156' ]
    });

    // Configuration du champs 'part description'
    $("#client_part_description").autocomplete({
        source : [ '10101-1250', '10101-1729', '10101-3981' ]
    });

    $("#client_file_number").change(() => omc.saveFileNumber($("#client_file_number").val()));
    $("#client_part_description").change(() => omc.savePartDescription($("#client_part_description").val()));
    
    // Affichage des données user si déjà entrées
    if (window.localStorage["omc.clientFileNumber"] != undefined)
    {
        $('#client_file_number').val(window.localStorage["omc.clientFileNumber"]);
    }

    if (window.localStorage["omc.clientPartDescription"] != undefined)
    {
        $('#client_part_description').val(window.localStorage["omc.clientPartDescription"]);
    }

    $gradeInput.change(() => {
        omc.deleteMatchingMaterials();
        gradeChanged($gradeInput.val());
    });

    $('#restart_session_button').button().click(() => {
        omc.resetStudy();
        $("#client_file_number").val(null);
        $("#client_part_description").val(null);
        $familySelect.val('-');
        $gradeInput.val('');
        $familySelect.selectmenu('refresh');
    });

    // Configuration des boutons de navigation
    $('#check_button').button();
    $('#upload_button').button();
    $('#visualisation_button').button().click(() => window.location = 'visualisation_m0.html');
    $('#next_step_button').button().click(() => window.location = 'codesign_space.html');
    $('#about').click(() => window.location = "https://alpenbox.kad-office.com/w/D%C3%A9finition_du_POC_AT-OMC_pour_le_choix_optimal_de_mat%C3%A9riau_recommand%C3%A9_au_client");
    $('#back_benco').click(() => window.location = 'index.html');
});
