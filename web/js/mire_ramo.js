var nbDisplayedMaterials = 0;
var nbSelectedTargets = 0;

function displayMatchingMaterial(material)
{
    var $displayCharacteristic = $('#performance_index_select option:selected');
    user.saveDisplayCharacteristic($displayCharacteristic.val());
    var $displayPriceIndex = $('#price_index_select option:selected');
    user.saveDisplayPriceIndex($displayPriceIndex.val());

    var nb = material.nb;
    nbDisplayedMaterials = (nbDisplayedMaterials < nb) ? nb : nbDisplayedMaterials; 

    console.debug('OMC', material);
    console.debug('OMC', user.displayCharacteristic);
    console.debug('OMC', user.displayPriceIndex);

    var x0 = omc.userMaterial.characteristics[user.displayCharacteristic];
    var xAmp = Math.max(x0, omc.ATTR_AMP[user.displayCharacteristic] - x0);

    var y0 = omc.userMaterial.characteristics[user.displayPriceIndex] || 100;
    var yAmp = Math.max(y0, omc.ATTR_AMP[user.displayPriceIndex] - y0);

    var pi = Number(material.characteristics.pi || 100);
    var pricePerTon = Number(material.characteristics.pricePerTon);

    var intervals = omc.toleranceIntervals || omc.defaultIntervals;
    if(intervals)
    {
        xAmp = Math.max(x0 - intervals[user.displayCharacteristic][0], intervals[user.displayCharacteristic][1] - x0);
    }

    var x = Number(material.characteristics[user.displayCharacteristic]);
    var y = Number(material.characteristics[user.displayPriceIndex]) || y0;

    if (material === omc.userMaterial)
    {
        var xs = 0;
    }
    else 
    {
        var xs = (x - x0) * (350.0 / xAmp);
    }
    var ys = (y - y0) * (350.0 / yAmp);

	var tooltipValue = $displayCharacteristic.attr("data-shortname") + " = " + (x * omc.ATTR_MULT[user.displayCharacteristic]).toFixed(0) + $displayCharacteristic.attr("data-unit");
    var title = 'M' + nb + ' : ' + material.name + ' (' + tooltipValue + ', Price per ton = ' + pricePerTon.toFixed(0) + ', Operation price index = ' + pi.toFixed(0) + ')';

	var color = (material.name == omc.userMaterial.name) ? user.userFavoriteColor : (pi <= 100) ? '#008800' : '#EAA60C';
	var mireId = ('mire_' + material.name).replace(/[^A-Za-z0-9_]+/gm,'_');
	$('#' + mireId).remove();
	mireFactory.create('#axe_abscisses', mireId, 352 + xs, -3 - ys, color).attr('title', title);

    if (nbDisplayedMaterials != 0)
    {
        $('#nb_material').text(nbDisplayedMaterials + " matching materials out of " + omc.materialDB.grades.length + " materials in Alpen'Tech's database.");
    }
}

function displayAll()
{
    var $selectedChar = $('#performance_index_select option:selected');
    $('#label_abscisses').text($selectedChar.text());
    var $selectedPriceIndex = $('#price_index_select option:selected');
    $('#label_ordonnées').text($selectedPriceIndex.text());
    $('.mire_container').remove();

    omc.matchingGradesComputationListener.push(() => {
        if (omc.matToken == 0)
        {
            $('#nb_material').text("No matching materials in Alpen'Tech's database.")
        }
        else
        {
            $('#nb_material').text("Solutions loaded : " + nbDisplayedMaterials + " matching materials out of " + omc.materialDB.grades.length + " materials in Alpen'Tech's database.")
        }

        $('.mire_container').click(event => {
            if ($(event.currentTarget).css("background-color") == "rgba(0, 0, 0, 0)" && nbSelectedTargets < 2)
            {
                $(event.currentTarget).css("background-color", "rgb(128, 128, 128)");
                nbSelectedTargets += 1;
                $(event.currentTarget).attr("selection_nb", nbSelectedTargets);
                var selectionNb = $(event.currentTarget).attr("selection_nb");

                var selectedMaterial = $(event.currentTarget).attr("id").split('_')[1];
                $('[attr=name_' + selectionNb + ']').text(selectedMaterial);


                for (key in omc.matchingMaterials[selectedMaterial].characteristics)
                {
                    var characValue = Number(omc.matchingMaterials[selectedMaterial].characteristics[key]);
                    var m0Value = Number($('[attr=' + key + '_0]').text());
                    $('[attr='+ key + '_' + selectionNb + ']').text(characValue.toFixed(2));


                    if (key == "pi")
                    {
                       if (characValue < m0Value)
                        {
                            $('[attr='+ key + '_' + selectionNb + ']').css('color', 'green');
                        }

                        else if (characValue > m0Value)
                        {
                            $('[attr='+ key + '_' + selectionNb + ']').css('color', 'red');
                        } 
                    }

                    else
                    {
                        if (characValue > m0Value)
                        {
                            $('[attr='+ key + '_' + selectionNb + ']').css('color', 'green');
                        }

                        else if (characValue < m0Value)
                        {
                            $('[attr='+ key + '_' + selectionNb + ']').css('color', 'red');
                        }
                    }
                    
                }
            }
            else if ($(event.currentTarget).css("background-color") == "rgb(128, 128, 128)")
            {
                $(event.currentTarget).css("background-color", "rgba(0, 0, 0, 0)");

                var selectionNb = $(event.currentTarget).attr("selection_nb");

                var selectedMaterial = $(event.currentTarget).attr("id").split('_')[1];
                $('[attr=name_' + selectionNb + ']').text('');

                for (key in omc.matchingMaterials[selectedMaterial].characteristics)
                {
                    $('[attr='+ key + '_' + selectionNb + ']').text('');
                }

                nbSelectedTargets -= 1;
            }
        });
    });

    omc.userMaterial.nb = 0;
    displayMatchingMaterial(omc.userMaterial);
	omc.withMatchingMaterials(displayMatchingMaterial);
}

omc.init();
user.init();

jQuery($ => {

    $.getJSON("poc.json", meta =>
        $('#versionning').text("v" + meta.version + " du " + meta.release_date)
    );

    $('[attr=name_0]').text(omc.userMaterial.name);
    $('[attr=family_0]').text(omc.userMaterial.family.split('_').join(' '));
    $('[attr=pi_0]').text("100.00");
    
    for (key in omc.userMaterial.characteristics)
    {
        var characValue = omc.userMaterial.characteristics[key];
        $('[attr='+ key + '_0]').text(Number(characValue).toFixed(2));
    }

    $('#back_button').button().click(() => window.location = 'codesign_space.html');
    $('#print_button').button().click(() => window.location = 'material_characteristics.html');
    $('#homepage_button').button().click(() => window.location = 'material_characteristics.html');
    $('#visualisation_button').button().click(() => window.location = 'visualisation_m0.html');

    $('#client_part_description').append(localStorage["omc.clientPartDescription"]);
    $('#client_file_number').append(localStorage["omc.clientFileNumber"]);

    var displayCharacteristic = user.displayCharacteristic || 'rm';
    $("#performance_index_select").val(displayCharacteristic);

    var displayPriceIndex = user.displayPriceIndex || 'pricePerTon';
    $("#price_index_select").val(displayPriceIndex);

	displayAll();

    $('#performance_index_select').selectmenu({ select: (event, ui) => {
        user.saveDisplayCharacteristic(ui.item.value);
        displayAll(ui.item.value);
	}});

    $('#price_index_select').selectmenu({ select: (event, ui) => {
        user.saveDisplayPriceIndex(ui.item.value);
        displayAll(ui.item.value);
    }});
});
