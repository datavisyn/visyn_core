### Major features overview

#### Study stats workbench

![image](https://github.com/datavisyn/bioinsight/assets/57343176/f0664ba2-88df-46dd-ae92-b3fadf49df96)

##### Study detail view

This view was improved in a way that when clicking on a genomic feature, a pre-filled dialog to add the genomic feature to the workbench data appears, as a shortcut to the "add data" button in the data table. This is a convenience feature for users to more easily add data to the current workbench.

##### Data table

The data table now shows the total row count, the number of currently visible rows (in case it is filtered) and the number of currently selected rows.

#### Biomarker definition workbench

![image](https://github.com/datavisyn/bioinsight/assets/57343176/f367ca0e-ab7c-4fcd-8179-569a9bde42ed)

##### Biomarker ~ readout association matrix

This matrix shows the current status of biomarker - readout calculations. A matirix cell can have 4 possible states: not started yet, in progress, finished and error. Interactions are only possible on finished cells. The calculation can only be triggered via the backend. When clicking on a matrix cell with a finished state, the detail view on the right side shows some additional information.

##### Biomarker ~ readout detail view

This view shows some information about the currently selected biomarker-readout combination from the matrix on the left side.

#### Biomarker associations workbench

![image](https://github.com/datavisyn/bioinsight/assets/57343176/797590e4-2e7d-478e-902b-5368e9740dec)

##### Sidebar

The biomarker associations workbench has in comparison to the previous workbenches, an additional tab in the sidebar, that allows users to see the biomarker-readout association matrix. This matrix serves as a selection basis for the following views on the right. Below the matrix, the second selection control panel is the gene list. The gene list defines genes of interest for the following analysis on the right. Users are able to load pre-defined gene lists from the backend and add individual genes to their list.

##### Deep linking

The singlet-based workbenches now also support deep linking, just like the study-based workbenches. This means that workbenches can be easily shared.
