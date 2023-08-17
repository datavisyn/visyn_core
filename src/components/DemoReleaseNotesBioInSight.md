#### Landing page

The landing page is designed with a very simple search interface, where you can search for targets/genes, compounds, and studies. When clicking on a search result, it brings you to the Analysis view. Instead of searching for an entity, users can also chose to view all available studies with their singlets by clicking on "Show all singlets" below the search.
![image](https://github.com/datavisyn/bioinsight/assets/57343176/5ba096cf-84f6-4717-ba83-0991156b248b)

#### Analysis view

The Analysis view consists of the search tree on the left and the actual data visualization dashboards on the right. Users are guided through the analysis workflow by the tabs on top (Study Stats, Study Genomic Features, Biomarker Definition, Biomarker Associations, Biomarker Analysis, Biomarker Ranking, Biomarker Report), where for now only the first two study-based tabs are available. These tabs show data on different aggregation levels (either study or singlet) and allow the users to dig deeper into the research data.

#### General workbench features

##### Singlets and the sidebar

The main entity of BioInsight is a Singlet. A singlet is a combination of 1 or more targets and 0 or 1 compounds. In BioInsight, targets have the color green, and compounds are red. Each singlet is assigned to a study, where one study can have multiple (even a few hundret) singlets. A study again belongs to a model type, of which we have 3 in BioInsight: Cell Line, PDX and Ex Vivo. Currently, BioInsight only has data for the Cell Line model, which is based on DepMep data.
The sidebar is an important conrol element in BioInsight. It shows all singlets which are assigned to a study. On top users can search for additional genes / compounds / studies to filter the tree below. Individual singlets can be selected which allows you to explore the corresponding data on the right.
![image](https://github.com/datavisyn/bioinsight/assets/57343176/98ecccfe-8224-4a64-9822-a204284bedb7)

##### Minimize / maximize views

Individual views can be minimized or maximized to have more space for exploration. The minimized views are collapsed on the bottom left and can be brought back by clicking on the blue bubbles.
![image](https://github.com/datavisyn/bioinsight/assets/57343176/98ecccfe-8224-4a64-9822-a204284bedb7)

##### Split view

For better comparison between two studies or singlets, our workbenches have a split-view mode. To enable split view, at least two tabs need to be open. By clicking on a tab and dragging it to the right side, users can enter the split view. By default, scrolling / closing and opening views is syncronized, but can be deactivated via the "Sync layout" button on the top right.
![image](https://github.com/datavisyn/bioinsight/assets/57343176/2bfbb006-ea40-4c47-a668-a85ae5b3ae94)

##### Reset / Syncronized layout

The layout across multiple tabs is syncronized by default, which means that opening / closing views will automatically be applied to other open tabs in the same workbench. The syncronizing can be disabled with the "Sync layout" button in the top right corner. It is also possible to reset the layout to the default by pressing the button right next the "Sync layout" button, which will reset the layout of all open tabs (if sync layout is active) or of the currently opened tab (if sync layout is deactivated).

#### Study stats workbench

The study stats workbench ist the first workbench in BioInsight. It shows general information and data on study level. It's devided into three views, where one is still to be implemented. The barchart on the top left shows the count for oncotree lineage grouped by sex by default. The visualization is fully interactive, users can select e.g. a bar, which causes the table below to be filtered for the selected data. This visualization can be highly customized, users can change which attributes to show on the axis, the grouping, and even the visualization type by opening the sidebar of the view by pressing the cog icon in the top right corner.
The data table on the bottom shows the study data in tabular form. Users can interact with the table, filter or sort by a column, add genomic features via the "add genomic feature" button and select rows which causes the barchart on top to adjust to the selection.
![image](https://github.com/datavisyn/bioinsight/assets/57343176/e5e43716-1b65-47c7-97f7-9e9840f8ecf2)

#### Study genomic features workbench

The study genomic features workbenchs shows, just like the study stats workbench, study related data and visualizations. The three views, which are currently implemented on this workbench are a distribution plot, a scatterplot matrix and a data table. The violin plot on the top left shows the distribution of the gene expression values by groth pattern for a selected gene. The configuration of the plot can be changed via the input fields on top. The scatterplot matix on the top left shows the gene expression per gene of the selected singlets in the sidebar.
![image](https://github.com/datavisyn/bioinsight/assets/57343176/d33ea5be-21da-4725-804d-b60ee79ca725)
