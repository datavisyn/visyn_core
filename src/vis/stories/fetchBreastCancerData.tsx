import { EColumnTypes, VisColumn } from '../interfaces';
import { breastCancerData as dataPromise } from './breastCancerData';

export function fetchBreastCancerData(): VisColumn[] {
  return [
    {
      info: {
        description: null,
        id: 'breastSurgeryType',
        name: 'Breast Surgery Type',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => dataPromise.map((r) => r.breastSurgeryType).map((val, i) => ({ id: i.toString(), val })),
      domain: ['MASTECTOMY', 'BREAST CONSERVING'],
    },
    {
      info: {
        description: null,
        id: 'cellularity',
        name: 'Cellularity',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => dataPromise.map((r) => r.cellularity).map((val, i) => ({ id: i.toString(), val })),
      domain: ['High', 'Moderate', 'Low'],
    },
    {
      info: {
        description: null,
        id: 'chemotherapie',
        name: 'Chemotherapy',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => dataPromise.map((r) => r.chemotherapie).map((val, i) => ({ id: i.toString(), val: val.toString() })),
    },
    {
      info: {
        description: null,
        id: 'pam50Subtype',
        name: 'PAM50 Subtype',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => dataPromise.map((r) => r.pam50Subtype).map((val, i) => ({ id: i.toString(), val })),
    },
    {
      info: {
        description: null,
        id: 'cohort',
        name: 'Cohort',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.map((r) => r.cohort).map((val, i) => ({ id: i.toString(), val })),
    },
    {
      info: {
        description: null,
        id: 'statusER',
        name: 'Status ER',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => dataPromise.map((r) => r.statusER).map((val, i) => ({ id: i.toString(), val })),
    },
    {
      info: {
        description: null,
        id: 'neoplasmHistologicGrade',
        name: 'Neoplasm Histologic Grade',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.map((r) => r.neoplasmHistologicGrade).map((val, i) => ({ id: i.toString(), val })),
    },
    {
      info: {
        description: null,
        id: 'her2Status',
        name: 'HER2 Status',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => dataPromise.map((r) => r.her2Status).map((val, i) => ({ id: i.toString(), val })),
    },
    {
      info: {
        description: null,
        id: 'tumorOtherHistologicSubtype',
        name: 'Tumor Other Histologic Subtype',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => dataPromise.map((r) => r.tumorOtherHistologicSubtype).map((val, i) => ({ id: i.toString(), val })),
    },
    {
      info: {
        description: null,
        id: 'hormoneTherapie',
        name: 'Hormone Therapy',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => dataPromise.map((r) => r.hormoneTherapie).map((val, i) => ({ id: i.toString(), val: val.toString() })),
    },
    {
      info: {
        description: null,
        id: 'inferredMenopausalState',
        name: 'Inferred Menopausal State',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => dataPromise.map((r) => r.inferredMenopausalState).map((val, i) => ({ id: i.toString(), val })),
    },
    {
      info: {
        description: null,
        id: 'integrativeCluster',
        name: 'Integrative Cluster',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.map((r) => r.integrativeCluster).map((val, i) => ({ id: i.toString(), val })),
    },
    {
      info: {
        description: null,
        id: 'primaryTumorLaterality',
        name: 'Primary Tumor Laterality',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => dataPromise.map((r) => r.primaryTumorLaterality).map((val, i) => ({ id: i.toString(), val })),
    },
    {
      info: {
        description: null,
        id: 'lymphNodesExaminedPositive',
        name: 'Lymph Nodes Examined Positive',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.map((r) => r.lymphNodesExaminedPositive).map((val, i) => ({ id: i.toString(), val })),
    },
    {
      info: {
        description: null,
        id: 'mutationCount',
        name: 'Mutation Count',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.map((r) => r.mutationCount).map((val, i) => ({ id: i.toString(), val })),
    },
    {
      info: {
        description: null,
        id: 'nottinghamPrognosticIndex',
        name: 'Nottingham Prognostic Index',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.map((r) => r.nottinghamPrognosticIndex).map((val, i) => ({ id: i.toString(), val })),
    },
    {
      info: {
        description: null,
        id: 'oncotreeCode',
        name: 'Oncotree Code',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => dataPromise.map((r) => r.oncotreeCode).map((val, i) => ({ id: i.toString(), val })),
    },
    {
      info: {
        description: null,
        id: 'survivalMonths',
        name: 'Survival Months',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.map((r) => r.survivalMonths).map((val, i) => ({ id: i.toString(), val })),
    },
    {
      info: {
        description: null,
        id: 'survival',
        name: 'Survival',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => dataPromise.map((r) => r.survival).map((val, i) => ({ id: i.toString(), val: val.toString() })),
    },
    {
      info: {
        description: null,
        id: 'statusPR',
        name: 'Status PR',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => dataPromise.map((r) => r.statusPR).map((val, i) => ({ id: i.toString(), val })),
    },
    {
      info: {
        description: null,
        id: 'radioTherapy',
        name: 'Radio Therapy',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => dataPromise.map((r) => r.radioTherapy).map((val, i) => ({ id: i.toString(), val: val.toString() })),
    },
    {
      info: {
        description: null,
        id: 'tumorSize',
        name: 'Tumor Size',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.map((r) => r.tumorSize).map((val, i) => ({ id: i.toString(), val })),
    },
    {
      info: {
        description: null,
        id: 'tumorStage',
        name: 'Tumor Stage',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.map((r) => r.tumorStage).map((val, i) => ({ id: i.toString(), val })),
    },
    {
      info: {
        description: null,
        id: 'deathFromCancer',
        name: 'Death From Cancer',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => dataPromise.map((r) => r.deathFromCancer).map((val, i) => ({ id: i.toString(), val })),
    },
    {
      info: {
        description: 'Gene expression',
        id: 'brca1GeneExpression',
        name: 'BRCA1',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.map((r) => r.brca1GeneExpression).map((val, i) => ({ id: i.toString(), val })),
    },
    {
      info: {
        description: 'Gene expression',
        id: 'brca2GeneExpression',
        name: 'BRCA2',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.map((r) => r.brca2GeneExpression).map((val, i) => ({ id: i.toString(), val })),
    },
    {
      info: {
        description: 'Gene expression',
        id: 'msh2GeneExpression',
        name: 'MSH2',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.map((r) => r.msh2GeneExpression).map((val, i) => ({ id: i.toString(), val })),
    },
    {
      info: {
        description: 'Gene expression',
        id: 'mycGeneExpression',
        name: 'MYC',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.map((r) => r.mycGeneExpression).map((val, i) => ({ id: i.toString(), val })),
    },
    {
      info: {
        description: 'Gene expression',
        id: 'stat2GeneExpression',
        name: 'STAT2',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.map((r) => r.stat2GeneExpression).map((val, i) => ({ id: i.toString(), val })),
    },
  ];
}
