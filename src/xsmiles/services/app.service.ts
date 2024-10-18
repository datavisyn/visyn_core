import { MoleculesDataset } from '../types/molecule.types';
import moleculesDatasetService from './molecules.dataset.service';

class AppService {
  public loadData = (files: any[], handleLoadedData: (molecules: MoleculesDataset) => void) => {
    files.forEach((file) => {
      const reader = new FileReader();

      reader.onabort = () => console.error('file reading was aborted');
      reader.onerror = () => console.error('file reading has failed');
      reader.onload = () => {
        // Do whatever you want with the file contents
        if (reader.result != null) {
          const json = JSON.parse(reader.result as string);

          const molecules: MoleculesDataset = moleculesDatasetService.getVersionControlledData(json);

          handleLoadedData(molecules);
        }
      };
      reader.readAsBinaryString(file);
    });
  };
}
export default new AppService();
